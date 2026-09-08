# 07. 배포·관측·환경변수 코드 읽기 전용 리뷰

작성일: 2026-08-28  
대상 레포: DONGLE-FRONT  
리뷰 방식: 코드·워크플로·배포 문서 읽기 전용. 실제 DNS/IAM/콘솔 상태는 제외. 소스와 다른 문서는 이 보고서 작성 시점에 수정하지 않음.

선행 확인 문서:

- `AGENTS.md`
- `docs/evals/README.md`
- `docs/evals/success-criteria.md`
- `docs/evals/test-inventory.md`
- `docs/evals/known-gaps.md`
- `docs/evals/roadmap.md`
- `docs/deployment-strategy.md`

---

## 범위

점검한 경로:

- GitHub Actions (`Main PR CI`, `prod-lightsail-deploy.yml`)
- 루트/앱 package scripts (`verify:fast`, `deploy:standalone:*`, 수동 `scp`/`rsync`)
- Next.js standalone (`output`, `outputFileTracingRoot`, static/public 복사)
- `ecosystem.config.js`와 PM2 reload
- Lightsail SSH/`ssh-keyscan`/rsync
- release 디렉터리와 `current.client` / `current.admin` symlink
- healthcheck, rollback, 동시 배포(`concurrency` / `cancel-in-progress`)
- 빌드 타임 vs 런타임 env 매핑
- secret 공개 경계 (`NEXT_PUBLIC_*`, PM2 env, Sentry auth token)
- Sentry release / sourcemap 업로드
- PostHog 초기화와 장애 격리

운영 경로 요약: GitHub Actions → Lightsail SSH/rsync → `releases/<git-sha>/{client,admin}` → `current.*` symlink → PM2 reload → `GET /api/health`.

이 리뷰는 읽기 전용이라 TDD·`pnpm verify:fast`·코드/문서 변경은 수행하지 않았다.

---

## 잘 맞는 계약

| 영역 | 상태 |
| --- | --- |
| standalone + `outputFileTracingRoot` + static/public 복사 | 맞음 |
| SHA 릴리스 디렉터리 + `current.*` symlink | 맞음 (동시성/롤백 env는 P0/P1) |
| `API_URL` / `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` 빌드+런타임 이중 주입 | 맞음 |
| `NEXT_PUBLIC_SENTRY_DSN` / `NEXT_PUBLIC_POSTHOG_TOKEN` 빌드 인라인 | 맞음 |
| `SENTRY_AUTH_TOKEN` 서버 미전달 | 맞음 |
| `REVALIDATE_SECRET` / `CLIENT_BASE_URL` 런타임 전용, webhook 실패 시 admin action 비실패 | 맞음 |
| PostHog 이벤트 이름/속성 화이트리스트, non-browser no-op | 맞음 (`init` 격리만 P1) |
| MSW `NEXT_PUBLIC_USE_MSW` 런타임 bracket 접근, 운영 env 미설정 | 운영에서 꺼짐 |

---

## P0

### 1. 동시 배포가 진행 중 잡을 취소하고, 원격 롤백이 안 돈다

| 항목 | 내용 |
| --- | --- |
| **위치** | `.github/workflows/prod-lightsail-deploy.yml:9-11`, `:186-309` |
| **심각도** | P0 |

```9:11:.github/workflows/prod-lightsail-deploy.yml
concurrency:
  group: prod-lightsail-deploy
  cancel-in-progress: true
```

원격 스크립트에 `trap`/`flock`이 없고, `rollback()`은 healthcheck 실패 분기에서만 호출된다.

**장애 시나리오:** `main` 연속 push 또는 `workflow_dispatch`가 겹치면, 앞 배포가 symlink 전환·`pm2 reload` 직후 SIGTERM으로 끊긴다. 러너 SSH가 죽으면 원격 `rollback()`은 실행되지 않는다. `rsync --delete` 도중 취소되면 해당 SHA 디렉터리가 반만 복사된 채로 남을 수 있다.

**rollback/관측 영향:** 검증되지 않은 릴리스가 라이브로 남거나, client/admin이 서로 다른 SHA를 볼 수 있다. Sentry `SENTRY_RELEASE`와 실제 바이너리가 어긋나 이후 스택/릴리스가 거짓이 된다. 자동 롤백은 동작하지 않는다.

**최소 수정:** `cancel-in-progress: false`로 바꾼다. 원격에 `flock` 배포 락과 `trap rollback EXIT/TERM`을 넣고, 취소가 나더라도 이전 symlink 타겟으로 되돌리게 한다.

**테스트·검증 제안:** 배포 중 두 번째 `workflow_dispatch`를 띄운 뒤, 서버에서 `readlink -f current.*`, `pm2 describe`, `GET /api/health`의 `release`가 하나의 SHA인지 확인한다. 취소된 잡의 원격 프로세스가 남아 있지 않은지도 본다.

---

## P1

### 2. 롤백이 symlink만 되돌리고 `.env.pm2.prod`는 새 값으로 남긴다

| 항목 | 내용 |
| --- | --- |
| **위치** | `.github/workflows/prod-lightsail-deploy.yml:219-258`, `:261-275` |
| **심각도** | P1 |

`cat > .env.pm2.prod`가 symlink 전환보다 먼저 실행된다. `rollback()`은 이전 `current.*`만 복구하고 env 파일은 복구하지 않는다. 이어서 `pm2 reload --update-env || true`를 호출한다.

**장애 시나리오:** 새 빌드가 healthcheck에서 실패한다. 코드는 이전 SHA로 돌아가지만 PM2 env의 `SENTRY_RELEASE`와, 키가 바뀌었다면 `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`는 새 값이다. 롤백 후 내부 healthcheck는 다시 보지 않고, 외부 URL만 `|| true`로 스킵한다.

**rollback/관측 영향:** 이전 코드가 새 릴리스 id로 Sentry에 올라간다. sourcemap이 안 맞는다. 같은 배포에서 암호화 키를 바꿨다면 롤백 이후 Server Action이 전부 깨지고, 워크플로는 실패로 끝나도 사이트는 복구된 것처럼 보이지 않는다.

**최소 수정:** symlink 전환 전에 기존 `.env.pm2.prod`를 백업하고, `rollback()`에서 파일과 symlink를 함께 되돌린 뒤 내부 `verify_release`를 다시 돌린다. `pm2 reload || true`를 제거해 롤백 실패를 숨기지 않는다.

**테스트·검증 제안:** 고의로 health route를 깨뜨린 SHA를 배포한 다음, 롤백 후 `current.*` 실경로와 `/api/health`의 `release`, Server Action 제출이 이전 릴리스와 일치하는지 확인한다.

### 3. healthcheck가 프로세스 liveness만 보고, 필수 런타임 계약은 안 본다

| 항목 | 내용 |
| --- | --- |
| **위치** | `apps/DONGLE-CLIENT/src/app/api/health/route.ts:5-11`, `apps/DONGLE-ADMIN/src/app/api/health/route.ts:5-11`, `.github/workflows/prod-lightsail-deploy.yml:212-217`, `:288-296` |
| **심각도** | P1 |

health는 항상 `ok: true`이고 `release` 문자열만 grep한다. `API_URL`, encryption key, `REVALIDATE_SECRET` 존재 여부는 보지 않는다. 워크플로도 시크릿 empty 가드가 없다.

**장애 시나리오:** `PROD_API_URL` 또는 `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`가 비어 있거나, 예시처럼 `/v1`이 빠진 채 들어간다. 빌드·rsync·PM2·healthcheck는 통과하고, 사용자 화면만 전부 실패한다.

**rollback/관측 영향:** 자동 롤백이 안 탄다. Sentry에는 페이지/액션 에러만 쌓이고 “배포 실패”로는 안 남는다.

**최소 수정:** 배포 job 시작 시 필수 시크릿 non-empty 검사를 넣는다. health에 `apiConfigured` 같은 자기 점검을 넣고, 워크플로는 `ok`와 `release`를 `jq`로 검증한다.

**테스트·검증 제안:** 빈 `API_URL`로 스테이징 배포를 돌려 health가 실패하는지, 정상 시크릿에서는 `release`가 `github.sha`와 같은지 확인한다.

### 4. `.env.pm2.prod` heredoc이 값을 인용하지 않아 시크릿이 깨질 수 있다

| 항목 | 내용 |
| --- | --- |
| **위치** | `.github/workflows/prod-lightsail-deploy.yml:187`, `:261-272` |
| **심각도** | P1 |

러너 `<<EOF`와 원격 `<<ENVFILE`이 모두 unquoted다. `$`, backtick, 개행이 들어 있는 `REVALIDATE_SECRET` / `PROD_API_URL`은 원격 셸에서 재확장된다.

**장애 시나리오:** 시크릿에 `$`가 있으면 값이 잘리거나 빈 문자열이 된다. 개행이 있으면 env 파일이 깨지고 이후 키가 통째로 빠진다.

**rollback/관측 영향:** revalidate webhook 401, API 호출 실패. health는 통과할 수 있다. 롤백해도 같은 깨진 env를 다시 읽는다 (P1-2와 결합).

**최소 수정:** 값을 printf `%q`로 쓰거나 JSON/dotenv 생성기로 파일을 만든다. 원격 heredoc은 quoted `<<'ENVFILE'`를 쓰고, 파일 권한은 `600`으로 둔다.

**테스트·검증 제안:** `$`와 backtick이 들어 있는 더미 시크릿으로 파일 내용과 `pm2 env`가 원문과 같은지 확인한다.

### 5. PostHog `init` 실패가 클라이언트 계측 전체를 같이 죽인다

| 항목 | 내용 |
| --- | --- |
| **위치** | `apps/DONGLE-CLIENT/instrumentation-client.ts:11-34` |
| **심각도** | P1 |

같은 모듈에서 `Sentry.init` 다음에 `posthog.init`을 try/catch 없이 호출하고, `onRouterTransitionStart`를 export한다.

**장애 시나리오:** 토큰/SDK 옵션(`defaults: "2026-01-30"`) 문제나 `posthog.init` throw가 나면 모듈 평가가 실패한다. Sentry 라우터 전환 훅과 클라이언트 부트스트랩이 함께 깨질 수 있다.

**rollback/관측 영향:** 사용자 앱이 안 뜨거나 hydration이 깨져도, 그 실패를 Sentry가 못 받을 수 있다. 서버 healthcheck는 통과한다.

**최소 수정:** `posthog.init`과 `trackDongleEvent`의 `capture`를 try/catch로 감싸고, 실패는 `console.error`만 남긴다. Sentry init/export와 분리한다.

**테스트·검증 제안:** 잘못된 `NEXT_PUBLIC_POSTHOG_TOKEN`으로 클라이언트 빌드 후 메인 페이지가 뜨는지, Sentry test event는 여전히 나가는지 확인한다.

### 6. 클라이언트 sourcemap 삭제 옵션이 없어 static과 함께 서버로 나갈 수 있다

| 항목 | 내용 |
| --- | --- |
| **위치** | `apps/DONGLE-CLIENT/next.config.ts:65-71`, `apps/DONGLE-ADMIN/next.config.ts:88-94`, `apps/DONGLE-CLIENT/package.json:16-18` |
| **심각도** | P1 |

`withSentryConfig`는 `widenClientFileUpload: true`만 있고 `sourcemaps.deleteSourcemapsAfterUpload` / `filesToDeleteAfterUpload`가 없다. 배포 스크립트는 `.next/static` 전체를 standalone에 복사한다.

**장애 시나리오:** 업로드 후 `.map`이 static에 남으면 `/_next/static/**/*.js.map`으로 원본 소스가 공개된다. 토큰이 없으면 업로드는 건너뛰고 map만 남을 수도 있다.

**rollback/관측 영향:** 소스 공개는 롤백으로 사라지지 않고, 이전 릴리스 static에도 남을 수 있다. 업로드가 안 되면 브라우저 스택은 minify된 채로만 보인다.

**최소 수정:** `sourcemaps.deleteSourcemapsAfterUpload: true`(또는 `filesToDeleteAfterUpload: [".next/static/**/*.map"]`)를 명시한다. 토큰 없을 때 빌드를 실패시킬지, map 생성을 끌지 결정한다.

**테스트·검증 제안:** `deploy:standalone:prod` 산출물에서 `.next/static/**/*.map`이 없는지, 운영에서 `*.js.map`이 404인지, Sentry 이슈에 원본 프레임이 붙는지 확인한다.

---

## P2

### 7. 매 배포마다 `ssh-keyscan`으로 호스트 키를 다시 믿는다

| 항목 | 내용 |
| --- | --- |
| **위치** | `.github/workflows/prod-lightsail-deploy.yml:130-133` |
| **심각도** | P2 |

**장애 시나리오:** DNS/경로가 가로채이면 배포 SSH가 잘못된 호스트에 키와 시크릿을 보낸다.

**rollback/관측 영향:** 잘못된 서버에 배포되거나, 운영 서버는 그대로인데 GitHub 잡은 성공으로 끝날 수 있다.

**최소 수정:** `LIGHTSAIL_HOST_KEY`를 고정 secret으로 두고 `known_hosts`에 핀한다. 매 배포 `ssh-keyscan`을 제거한다.

**테스트·검증 제안:** 핀된 키와 다른 호스트 키를 주면 배포가 실패하는지 확인한다.

### 8. 이전 릴리스를 지우지 않아 디스크가 찬다

| 항목 | 내용 |
| --- | --- |
| **위치** | `.github/workflows/prod-lightsail-deploy.yml:135-170` (prune 없음), `docs/deployment-strategy.md:21-28` |
| **심각도** | P2 |

**장애 시나리오:** standalone이 쌓이다가 디스크 full이 되면 rsync/`pm2 save`가 실패한다.

**rollback/관측 영향:** 새 배포 실패 시 롤백 디렉터리까지 못 쓸 수 있다. 관측보다 인프라 다운이 먼저다.

**최소 수정:** 성공한 배포 끝에서 현재·직전 N개를 남기고 `releases/`를 삭제한다. 롤백 대상은 지우지 않는다.

**테스트·검증 제안:** 3회 연속 배포 후 `releases/` 개수가 상한 이하인지, `current.*`가 살아있는 SHA를 가리키는지 확인한다.

### 9. 외부 healthcheck는 HTTP 200만 보고, health 응답에 cache 헤더가 없다

| 항목 | 내용 |
| --- | --- |
| **위치** | `.github/workflows/prod-lightsail-deploy.yml:298-306`, `apps/DONGLE-CLIENT/src/app/api/health/route.ts`, `apps/DONGLE-ADMIN/src/app/api/health/route.ts` |
| **심각도** | P2 |

**장애 시나리오:** `PROD_*_HEALTHCHECK_URL`이 앞단 캐시/구버전 200을 받으면, 내부 release 불일치 뒤에 외부 검사가 거짓 성공하거나 그 반대가 된다.

**rollback/관측 영향:** 내부는 실패해 롤백하는데 외부는 통과한 것처럼 보이거나, 캐시된 200 때문에 잘못된 릴리스가 확정된다.

**최소 수정:** 외부 검사에도 `release`를 검증하고, health 응답에 `Cache-Control: no-store`를 넣는다.

**테스트·검증 제안:** 캐시 가능한 프록시 뒤에서 연속 배포 시 외부 URL `release`가 새 SHA로 바뀌는지 확인한다.

### 10. Sentry 업로드 시크릿이 비어도 빌드가 계속된다

| 항목 | 내용 |
| --- | --- |
| **위치** | `.github/workflows/prod-lightsail-deploy.yml:100-117`, `docs/deployment-strategy.md:79-83` |
| **심각도** | P2 |

**장애 시나리오:** `CLIENT_SENTRY_AUTH_TOKEN` 등이 빠지면 sourcemap 업로드만 건너뛰고 배포는 성공한다.

**rollback/관측 영향:** 운영 에러는 minify 스택만 보인다. 롤백과 무관하게 관측이 깨진다.

**최소 수정:** org/project/token을 쓸 거면 세트를 필수로 만들고, 하나라도 없으면 빌드를 실패시킨다. 아니면 문서에 “없으면 심볼리케이션 없음”을 명시한다.

**테스트·검증 제안:** 토큰 없이 빌드하면 실패하는지, 있으면 Sentry release `github.sha`에 아티팩트가 붙는지 확인한다.

### 11. `NEXT_PUBLIC_S3_URL`이 운영 빌드/PM2에 없고, next.config hostname 형식과도 어긋난다

| 항목 | 내용 |
| --- | --- |
| **위치** | `apps/DONGLE-CLIENT/next.config.ts:51-59`, `apps/DONGLE-ADMIN/next.config.ts:52-60`, `apps/DONGLE-CLIENT/.env.example:2`, `.github/workflows/prod-lightsail-deploy.yml` (해당 키 없음) |
| **심각도** | P2 |

운영 빌드는 `s3.ap-northeast-2.amazonaws.com`만 허용한다. 예시는 `https://s3.example.com` 전체 URL인데, next.config는 그것을 `hostname`으로 쓴다.

**장애 시나리오:** 실제 이미지 호스트가 `bucket.s3.ap-northeast-2.amazonaws.com` 또는 CDN이면 `next/image`가 거부한다.

**rollback/관측 영향:** 배포는 성공하고 이미지만 깨진다. health/Sentry release는 정상이다.

**최소 수정:** 사용할 호스트를 하드코딩하거나, 운영 빌드에 hostname만 담긴 값을 넣는다. 전체 URL을 hostname에 넣지 않는다.

**테스트·검증 제안:** 실제 아이콘/썸네일 URL 호스트로 이미지 페이지를 렌더해 400이 안 나는지 확인한다.

### 12. 클라이언트 `Sentry.init(release)`가 `NEXT_PUBLIC_`가 아니다

| 항목 | 내용 |
| --- | --- |
| **위치** | `apps/DONGLE-CLIENT/instrumentation-client.ts:16`, `apps/DONGLE-ADMIN/instrumentation-client.ts:14` |
| **심각도** | P2 |

브라우저 번들의 `process.env.SENTRY_RELEASE`는 Next가 인라인하지 않는다. 매칭은 `@sentry/nextjs` bundler plugin inject에 달려 있다.

**장애 시나리오:** 플러그인 inject가 안 되면 브라우저 이벤트 `release`가 비고, 서버/health만 SHA를 가진다.

**rollback/관측 영향:** 서버 이슈는 심볼리케이션되고 브라우저 이슈는 안 된다. 롤백 healthcheck는 서버 release만 봐서 이 공백을 모른다.

**최소 수정:** 빌드 시 `NEXT_PUBLIC_SENTRY_RELEASE=$SENTRY_RELEASE`를 넣거나, client init에서 `release`를 생략하고 플러그인 inject만 사용한다.

**테스트·검증 제안:** 운영 브라우저 이벤트와 서버 이벤트의 `release`가 같은 SHA인지 Sentry에서 확인한다.

### 13. `sendDefaultPii: true`가 서버/클라이언트 Sentry에 켜져 있다

| 항목 | 내용 |
| --- | --- |
| **위치** | `apps/DONGLE-CLIENT/sentry.server.config.ts:11`, `apps/DONGLE-CLIENT/instrumentation-client.ts:14`, `apps/DONGLE-ADMIN/sentry.server.config.ts:11`, `apps/DONGLE-ADMIN/instrumentation-client.ts:12` (edge 설정도 동일 패턴) |
| **심각도** | P2 |

**장애 시나리오:** IP·요청 PII가 Sentry로 간다. DSN은 공개 값이므로 브라우저 SDK 남용 시 이벤트 폭주 여지가 있다.

**rollback/관측 영향:** 배포 롤백과 무관하다. 개인정보/노이즈 관측 문제다.

**최소 수정:** 운영에서 `sendDefaultPii: false`로 두고, 필요한 식별자만 명시적으로 붙인다.

**테스트·검증 제안:** 테스트 예외 이벤트에 IP/쿠키가 없는지 확인한다.

### 14. PostHog `/ingest` rewrite가 Next 프로세스에 붙는다

| 항목 | 내용 |
| --- | --- |
| **위치** | `apps/DONGLE-CLIENT/next.config.ts:8-22` |
| **심각도** | P2 |

**장애 시나리오:** PostHog 장애 시 `/ingest` 프록시 연결이 서버에 쌓인다. 인스턴스가 1개라 페이지 SSR까지 영향을 줄 수 있다.

**rollback/관측 영향:** 앱 배포와 무관한 외부 의존 장애가 프론트 가용성을 깎는다. health는 통과할 수 있다.

**최소 수정:** ingest에 짧은 프록시 타임아웃을 두거나, 분석 트래픽을 앱 프로세스와 분리한다.

**테스트·검증 제안:** PostHog 호스트를 막아 둔 채 `/ingest`와 메인 페이지 응답 시간을 비교한다.

### 15. 수동 `scp`는 라이브 디렉터리를 `--delete`로 덮어쓴다

| 항목 | 내용 |
| --- | --- |
| **위치** | `package.json:22-26`, `.env.deploy.example:10-12` |
| **심각도** | P2 |

**장애 시나리오:** `.env.deploy`가 `current.client`를 가리키면 운영 symlink 타겟을 직접 지우고, SHA 릴리스/롤백 경로를 우회한다.

**rollback/관측 영향:** GitHub 롤백이 이 경로를 모른다. 운영이 수동 산출물과 섞인다.

**최소 수정:** 수동 스크립트가 릴리스 디렉터리+symlink만 쓰게 하거나, 문서/스크립트에 운영 `current.*` 경로를 금지한다.

**테스트·검증 제안:** 예시 경로가 `releases/` 아래인지, `--delete` 대상이 `current.*`가 아닌지 확인한다.

---

## P3

### 16. 문서와 워크플로 필수 시크릿이 어긋난다

| 항목 | 내용 |
| --- | --- |
| **위치** | `docs/deployment-strategy.md:68-77` vs `.env.github-secrets.prod.example:12`, `.github/workflows/prod-lightsail-deploy.yml:99` |
| **심각도** | P3 |

`CLIENT_NEXT_PUBLIC_POSTHOG_TOKEN`은 워크플로/예시에만 있고, 전략 문서 필수 목록에는 없다. `E2E_*`는 예시에 남아 있고 e2e job은 비활성이다.

**영향:** PostHog가 조용히 꺼져도 배포는 성공한다. e2e 시크릿을 필수로 오해할 수 있다.

**최소 수정:** 전략 문서 필수/선택 목록을 워크플로와 맞춘다.

**테스트·검증 제안:** 문서 목록과 workflow `secrets.*` 참조를 대조하는 체크리스트를 배포 전에 한 번 돌린다.

### 17. health `grep`이 JSON 공백/필드 순서에 의존한다

| 항목 | 내용 |
| --- | --- |
| **위치** | `.github/workflows/prod-lightsail-deploy.yml:216` |
| **심각도** | P3 |

지금은 `NextResponse.json()` compact라 통과한다. pretty-print나 필드 추가 시 거짓 실패 → 불필요한 롤백이 난다.

**최소 수정:** `jq -e --arg r "$expected" '.ok==true and .release==$r'`를 사용한다.

**테스트·검증 제안:** health JSON에 공백/필드 추가 픽스처를 넣어 현재 grep가 깨지고 `jq`는 통과하는지 확인한다.

### 18. 첫 배포 실패 시 이전 타겟이 없어 롤백이 빈손이다

| 항목 | 내용 |
| --- | --- |
| **위치** | `.github/workflows/prod-lightsail-deploy.yml:196-206`, `:226-232` |
| **심각도** | P3 |

**최소 수정:** 이전이 없으면 실패한 새 symlink를 떼고 PM2를 내리거나, 첫 배포를 별도 bootstrap으로 분리한다.

**테스트·검증 제안:** symlink가 없는 빈 서버에서 실패한 첫 배포 후 `current.*`와 PM2 상태를 확인한다.

### 19. PM2가 앱별로 상대방 DSN/`CLIENT_BASE_URL`까지 읽는다

| 항목 | 내용 |
| --- | --- |
| **위치** | `ecosystem.config.js:80-104`, `:113-139` |
| **심각도** | P3 |

`...pm2Env` spread로 client 프로세스에 `ADMIN_NEXT_PUBLIC_SENTRY_DSN`, `CLIENT_BASE_URL`이 들어간다. 브라우저로 새지는 않지만 서버 env 덤프 시 경계가 넓다.

**최소 수정:** 앱별로 필요한 키만 `env`에 넣는다.

**테스트·검증 제안:** `pm2 env dongle.client.prod`에 admin 전용 키가 없는지 확인한다.

### 20. Sentry 예시 페이지가 앱 라우터에 남아 있다

| 항목 | 내용 |
| --- | --- |
| **위치** | `apps/DONGLE-CLIENT/src/app/sentry-example-page/page.tsx:4-6`, `apps/DONGLE-ADMIN/src/app/sentry-example-page/page.tsx:4-6` |
| **심각도** | P3 |

운영 빌드에 `SENTRY_ENVIRONMENT=production`이 있어 대체로 404다. 로컬 `deploy:standalone:prod`가 이 env 없이 빌드하면 페이지가 살아 남을 수 있다.

**최소 수정:** 예시 라우트를 제거하거나, 빌드 타임 `NODE_ENV`로 가드한다.

**테스트·검증 제안:** 운영과 env 없는 prod 빌드에서 `/sentry-example-page`가 404인지 확인한다.

### 21. PM2 `fork` 1 인스턴스 reload는 짧은 다운타임이 있다

| 항목 | 내용 |
| --- | --- |
| **위치** | `ecosystem.config.js:59-67` |
| **심각도** | P3 |

`wait_ready`가 없고 `listen_timeout: 10000`이다. 부팅이 길면 health retry로 커버되지만, reload 순간 요청은 끊긴다.

**최소 수정:** 문서에 다운타임을 명시하거나, 여력이 되면 `wait_ready`+`listen` 신호를 붙인다.

**테스트·검증 제안:** 배포 중 client/admin에 연속 요청을 보내 5xx/연결 실패 구간이 얼마나 긴지 측정한다.

### 22. 운영 배포 e2e 게이트가 꺼져 있다

| 항목 | 내용 |
| --- | --- |
| **위치** | `.github/workflows/prod-lightsail-deploy.yml:21-71` |
| **심각도** | P3 |

문서화된 TODO다. 프론트가 정상이어도 배포가 막히던 문제를 피한 대신, 인증/라우팅 연결 회귀는 운영에서만 드러난다.

**최소 수정:** 재활성화 전에 e2e와 deploy build 중복을 정리하고, 외부 API 의존을 분리한다.

**테스트·검증 제안:** 재활성화 시 e2e 실패가 배포를 막는지, 프론트만 정상인 경우와 백엔드 시드 부재를 구분하는지 확인한다.

---

## 우선 수정 순서

1. `cancel-in-progress: false` + 원격 flock/trap
2. 롤백 시 `.env.pm2.prod` 복구 + 롤백 후 health 재검증
3. 필수 시크릿 non-empty + health가 API/키 설정을 보게
4. env 파일 quoting / `chmod 600`
5. PostHog init 격리
6. 클라이언트 sourcemap 업로드 후 삭제

---

## 잔여 리스크

- 실제 Lightsail 디스크, PM2 프로세스, DNS, IAM, GitHub secret 등록 여부, Sentry/PostHog 콘솔의 릴리스·sourcemap 존재는 이 리뷰에서 확인하지 않았다.
- `cancel-in-progress: true`가 유지되는 한, 연속 merge만으로 운영이 반쯤 전환된 채 남을 수 있다.
- health가 liveness만 보는 한, 빈 `API_URL`/encryption key 배포는 성공으로 기록된다.
- 롤백이 env 파일을 되돌리지 않으면, 실패한 배포 이후 Sentry release와 Server Action 키가 이전 코드와 어긋난다.
- 클라이언트 sourcemap이 standalone static에 남는지 여부는 실제 prod 산출물을 열어보기 전에는 확정이 아니다. 현재 설정은 삭제를 명시하지 않는다.
- 브라우저 Sentry `release`가 플러그인 inject에 의존하므로, 업로드 토큰 부재와 겹치면 브라우저 관측만 깨질 수 있다.
- `NEXT_PUBLIC_S3_URL` 공백은 실제 이미지 호스트가 path-style `s3.ap-northeast-2.amazonaws.com`이면 문제가 되지 않을 수 있다. 버킷 서브도메인/CDN이면 운영에서만 드러난다.
- 수동 `scp` 경로가 살아 있어, GitHub 릴리스 전략과 별개로 운영 디렉터리를 덮어쓸 수 있다.
- 운영 e2e 게이트가 꺼져 있어 인증·라우팅 연결 회귀는 배포 파이프라인이 잡지 않는다.

# Deployment Strategy

이 문서는 운영 배포 경로와 롤백 전략을 정리한다.

## 개요

- 운영 배포 대상은 `dongle-client`, `dongle-admin` 두 Next.js standalone 앱이다.
- GitHub Actions가 `main` 반영 후 Lightsail 서버로 standalone 산출물을 전송한다.
- 프로세스 관리는 PM2가 담당한다.

## 배포 흐름

1. `Main PR CI`가 PR에서 `pnpm verify:fast`, `pnpm build`를 검증한다.
2. `main`에 merge되면 `prod-lightsail-deploy.yml`이 실행된다.
3. 배포 workflow는 다시 `pnpm verify:fast`를 실행한다.
4. client/admin standalone 산출물을 각각 `releases/<git-sha>/client`, `releases/<git-sha>/admin`에 업로드한다.
5. 운영 symlink인 `current.client`, `current.admin`을 새 릴리스로 전환한다.
6. PM2가 `current.*` 경로의 `server.js`를 reload 한다.
7. 내부 healthcheck와 선택적 외부 healthcheck를 통과하면 배포를 확정한다.

## 디렉터리 구조

- 루트: `/home/ec2-user/dongle.front.prod`
- 릴리스 저장소: `/home/ec2-user/dongle.front.prod/releases/<git-sha>`
- 현재 운영 client symlink: `/home/ec2-user/dongle.front.prod/current.client`
- 현재 운영 admin symlink: `/home/ec2-user/dongle.front.prod/current.admin`

PM2는 운영에서 직접 릴리스 디렉터리를 보지 않고 `current.client`, `current.admin` symlink를 따라간다.

## Healthcheck

두 앱 모두 내부 health route를 제공한다.

- client: `GET /api/health`
- admin: `GET /api/health`

응답은 다음 정보를 포함한다.

- `ok` — 필수 런타임 설정(`API_URL`, `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`)이 모두 채워졌는지에 대한 자기 점검 결과. 하나라도 비어 있으면 `false`
- `app`
- `environment`
- `release`
- `apiConfigured` — `ok`와 동일한 자기 점검 값(명시적 필드)

응답에는 `Cache-Control: no-store`가 붙어 프록시/CDN 캐시가 오래된 상태를 되돌려주지 않게 한다.

운영 배포 workflow는 서버 내부에서 다음 검증을 수행한다.

- `http://127.0.0.1:3000/api/health`
- `http://127.0.0.1:4000/api/health`

`jq -e`로 `ok == true`와 `release`가 현재 배포 중인 Git SHA와 같은지 함께 검증한다. `ok`가 자기 점검을 포함하므로 필수 시크릿이 비어 배포된 경우에도 이 단계에서 실패로 잡혀 롤백된다.

선택적으로 공개 URL healthcheck를 추가할 수 있다. 이 URL도 내부 healthcheck와 동일하게 `release` 일치까지 검증한다(캐시된 응답이 배포 확정을 속이는 것을 방지).

- `PROD_CLIENT_HEALTHCHECK_URL`
- `PROD_ADMIN_HEALTHCHECK_URL`

## 동시 배포 방지

- GitHub Actions concurrency 그룹(`prod-lightsail-deploy`)은 `cancel-in-progress: false`다. 연속 `main` push나 재실행이 있어도 앞선 배포를 취소하지 않고 큐잉한다.
- 원격 서버에서도 `$ROOT_DIR/deploy.lock`에 `flock`을 걸어, 그룹 밖에서 워크플로가 겹쳐 실행되는 경우까지 이중으로 막는다.

## 롤백 전략

원격 배포 스크립트는 `trap`으로 `EXIT`/`TERM`/`HUP`/`INT`에서 롤백 함수를 걸어 둔다. healthcheck 실패뿐 아니라 SSH 연결이 끊기거나 워크플로가 취소돼도 동일하게 롤백이 실행된다.

1. symlink 전환 전 기존 `current.client`, `current.admin` 대상 경로와 `.env.pm2.prod`를 `.env.pm2.prod.bak`으로 백업한다.
2. 새 릴리스로 symlink를 바꾸고 `.env.pm2.prod`를 새 값으로 쓴 뒤 PM2 reload를 시도한다.
3. 내부/외부 healthcheck는 `jq -e`로 `ok == true` 및 `release`가 배포 중인 SHA와 같은지 함께 검증한다.
4. 실패(healthcheck, SSH 종료, 워크플로 취소 포함)하면 symlink와 `.env.pm2.prod`를 함께 이전 값으로 되돌리고 PM2를 다시 reload한 뒤, 되돌린 릴리스로 내부 healthcheck를 재검증한다.
5. 이전 릴리스가 없는 첫 배포가 실패하면 symlink를 만들지 않고 PM2를 정지시켜, 검증되지 않은 첫 릴리스가 그대로 서비스되는 상태를 막는다(bootstrap 안전장치).
6. workflow는 실패 상태로 종료한다.

이 방식은 배포 대상 디렉터리를 직접 덮어쓰는 방식보다 복구 시간이 짧고, 이전 산출물을 보존할 수 있다.

## 릴리스 정리

배포가 성공하면 `$RELEASES_DIR` 아래 최신 `KEEP_RELEASES`(기본 5)개만 남기고 오래된 릴리스 디렉터리를 삭제한다. 실패한 배포의 롤백 대상은 이 시점 이전이라 삭제되지 않는다.

## 필수 시크릿

배포 job은 시작 시 아래 값이 모두 non-empty인지 검사하고, 하나라도 비어 있으면 빌드 전에 실패한다.

- `PROD_API_URL`
- `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`
- `LIGHTSAIL_HOST`
- `LIGHTSAIL_HOST_KEY` — SSH host key 고정용(아래 "호스트 키 고정" 참고)
- `LIGHTSAIL_SSH_KEY`
- `CLIENT_NEXT_PUBLIC_SENTRY_DSN`
- `ADMIN_NEXT_PUBLIC_SENTRY_DSN`
- `REVALIDATE_SECRET`
- `PROD_CLIENT_BASE_URL`

`CLIENT_NEXT_PUBLIC_POSTHOG_TOKEN`은 필수 검사 대상은 아니지만 client 빌드에 실제 전달된다. 비어 있으면 PostHog가 조용히 꺼진 채로 배포가 성공한다.

## 선택 시크릿

- `PROD_CLIENT_HEALTHCHECK_URL`
- `PROD_ADMIN_HEALTHCHECK_URL`
- `CLIENT_NEXT_PUBLIC_POSTHOG_TOKEN`
- Sentry sourcemap 업로드용 org/project/token 값 — client/admin 각각 org/project/token 세 개를 세트로 비우거나 세트로 채워야 한다. 하나라도 있는데 다른 하나가 비면 배포가 실패한다(부분 설정 방지). 세트가 전부 비어 있으면 sourcemap 업로드를 건너뛰고 경고 로그만 남긴다.

## 호스트 키 고정

매 배포 `ssh-keyscan`으로 호스트 키를 새로 신뢰하지 않는다. `LIGHTSAIL_HOST_KEY` secret(예: `ssh-ed25519 AAAA...` 형식)을 `known_hosts`에 직접 기록해 DNS/경로 가로채기 시 배포가 실패하도록 한다.

`ssh-keyscan -t ed25519 <host>` 등으로 한 번 뽑은 값을 secret으로 등록해 둔다.

## 환경변수 정리

### GitHub Actions Secrets

운영 자동 배포 workflow는 다음 GitHub secrets를 읽는다.

등록할 secret 목록은 루트의 [.env.github-secrets.prod.example](../.env.github-secrets.prod.example)에 예시로 정리한다.

필수 secret:

- `PROD_API_URL`
  - client/admin 서버 런타임에서 사용하는 백엔드 API base URL
- `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`
  - Next Server Actions 암호화 키
- `LIGHTSAIL_HOST`
  - 운영 Lightsail SSH 접속 호스트
- `LIGHTSAIL_HOST_KEY`
  - `known_hosts`에 고정할 SSH host public key (`<key-type> <base64>` 형식). 매 배포 `ssh-keyscan`으로 새로 신뢰하지 않기 위함
- `LIGHTSAIL_SSH_KEY`
  - 운영 서버 배포용 PEM 키 내용
- `CLIENT_NEXT_PUBLIC_SENTRY_DSN`
  - client 브라우저 Sentry DSN
- `ADMIN_NEXT_PUBLIC_SENTRY_DSN`
  - admin 브라우저 Sentry DSN
- `REVALIDATE_SECRET`
  - ADMIN이 main-banner/club-schedule 캐시를 무효화할 때 CLIENT의 `/api/revalidate`를 호출하기 위한 공유 시크릿. ADMIN/CLIENT PM2 env에 동일한 값으로 들어가야 함
- `PROD_CLIENT_BASE_URL`
  - ADMIN이 cross-app 캐시 무효화 요청을 보낼 CLIENT origin. 예: `https://dongle.example.com`

Sentry sourcemap 업로드용 secret (client/admin 각각 org/project/token 세트로 채우거나 세트로 비워야 함):

- `CLIENT_SENTRY_AUTH_TOKEN`
  - client sourcemap 업로드용 Sentry auth token
- `CLIENT_SENTRY_ORG`
  - client Sentry org
- `CLIENT_SENTRY_PROJECT`
  - client Sentry project
- `ADMIN_SENTRY_AUTH_TOKEN`
  - admin sourcemap 업로드용 Sentry auth token
- `ADMIN_SENTRY_ORG`
  - admin Sentry org
- `ADMIN_SENTRY_PROJECT`
  - admin Sentry project

선택 secret:

- `PROD_CLIENT_HEALTHCHECK_URL`
  - client 외부 healthcheck URL. 예: `https://dongle.wavers.kr/api/health`
- `PROD_ADMIN_HEALTHCHECK_URL`
  - admin 외부 healthcheck URL. 예: `https://admin.dongle.wavers.kr/api/health`
- `CLIENT_NEXT_PUBLIC_POSTHOG_TOKEN`
  - client 브라우저 번들에 노출되는 PostHog public token. 비어 있으면 PostHog만 조용히 꺼진 채 배포된다

### PM2 런타임 env

배포 workflow는 GitHub Secrets 값을 서버 런타임에서 읽을 수 있도록 `$ROOT_DIR/.env.pm2.prod` 파일로 매 배포마다 다시 쓴다.
이 파일은 직접 관리하는 설정 원본이 아니라 PM2 실행용 산출물이다.

주요 항목:

- `API_URL`
  - PM2로 실행되는 client/admin 서버가 호출할 백엔드 API base URL
- `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`
  - standalone 서버에서 Server Action payload를 복호화할 때 쓰는 키
- `SENTRY_ENVIRONMENT`
  - Sentry 이벤트에 붙는 환경 이름. 운영 배포에서는 `production`
- `SENTRY_RELEASE`
  - Sentry 이벤트와 healthcheck가 공유하는 릴리스 id. 운영 배포에서는 Git SHA
- `CLIENT_NEXT_PUBLIC_SENTRY_DSN`
  - client 브라우저 번들에 노출되는 Sentry DSN
- `ADMIN_NEXT_PUBLIC_SENTRY_DSN`
  - admin 브라우저 번들에 노출되는 Sentry DSN
- `DEPLOY_CLIENT_DIR_PROD`
  - PM2가 client standalone `server.js`를 찾을 운영 symlink 경로
- `DEPLOY_ADMIN_DIR_PROD`
  - PM2가 admin standalone `server.js`를 찾을 운영 symlink 경로
- `REVALIDATE_SECRET`
  - ADMIN→CLIENT cross-app 캐시 무효화 webhook 인증용 공유 시크릿 (client/admin 모두 같은 값 사용)
- `CLIENT_BASE_URL`
  - ADMIN이 cross-app 캐시 무효화 요청을 보낼 CLIENT origin (`PROD_CLIENT_BASE_URL` secret 값을 그대로 씀)

client/admin 모두 같은 Git SHA를 배포하므로 앱별 `*_SENTRY_ENVIRONMENT`, `*_SENTRY_RELEASE`는 별도로 만들지 않는다.

### 수동 SCP 배포용 `.env.deploy`

로컬에서 수동 SCP 스크립트를 쓸 때는 루트의 `.env.deploy`를 사용한다.
현재 기본 배포 경로는 dev는 Render, prod는 GitHub Actions이므로 `.env.deploy`는 필수 운영 설정이 아니라 수동 fallback 용도다.

`pnpm scp:client` / `pnpm scp:admin`은 GitHub Actions 배포와 동일하게 release 디렉터리에 새로 업로드한 뒤 symlink만 전환한다(`rsync --delete`로 운영 디렉터리를 직접 덮어쓰지 않는다). `DEPLOY_*_CURRENT`에는 운영 `current.client`/`current.admin`과 별개의 symlink 경로를 지정해, GitHub 릴리스 전략과 수동 배포가 같은 symlink를 다투지 않게 한다.

필수 항목:

- `DEPLOY_PEM`
  - 수동 SCP 배포에서 사용할 SSH private key 경로. 기본 키를 쓰면 생략 가능
- `DEPLOY_USER`
  - 수동 SCP 배포 SSH 사용자
- `DEPLOY_HOST`
  - 수동 SCP 배포 대상 호스트
- `DEPLOY_CLIENT_RELEASES_DIR`
  - 수동 SCP가 client standalone 산출물을 `manual-<timestamp>` 하위 디렉터리로 업로드할 릴리스 루트
- `DEPLOY_ADMIN_RELEASES_DIR`
  - 수동 SCP가 admin standalone 산출물을 업로드할 릴리스 루트
- `DEPLOY_CLIENT_CURRENT`
  - 업로드 완료 후 전환할 client symlink 경로
- `DEPLOY_ADMIN_CURRENT`
  - 업로드 완료 후 전환할 admin symlink 경로

현재 예시는 `.env.deploy.example`에 정리되어 있다.

## PM2 reload 다운타임

`ecosystem.config.js`는 앱당 `instances: 1`, `exec_mode: "fork"`이고 `wait_ready` 신호를 쓰지 않는다. `pm2 reload`는 새 프로세스가 `listen_timeout`(10초) 안에 포트를 열 때까지 짧은 다운타임이 있을 수 있다. 배포 workflow의 healthcheck 재시도(`--retry 10 --retry-delay 2`)가 이 구간을 흡수하지만, reload 순간에 들어온 요청은 끊길 수 있다. 무중단이 필요해지면 `wait_ready` + `process.send("ready")` 신호를 앱에 추가하는 것을 검토한다.

## e2e 게이트

운영 배포 workflow의 `e2e-full` job은 비활성화되어 있다(`prod-lightsail-deploy.yml` 상단 TODO 참고). 외부 E2E API 가용성/시드 데이터에 배포가 종속되는 문제 때문이며, 재활성화 전 build 중복 제거와 외부 API 의존 분리가 필요하다. `.env.github-secrets.prod.example`의 `E2E_*` 항목은 이 job이 다시 켜질 때를 대비한 값이고, 지금은 운영 배포에 필수가 아니다.

## 운영 체크리스트

- `main` 브랜치 보호 활성화
- required status check에 `Main PR CI / validate` 지정
- `main` direct push 금지
- 운영 배포 전 PR CI 통과 확인
- 운영 배포 후 healthcheck와 주요 사용자 흐름 수동 점검

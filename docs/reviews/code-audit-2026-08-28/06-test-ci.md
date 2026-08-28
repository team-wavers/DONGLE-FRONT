# 테스트·CI 품질 읽기 전용 리뷰

- 일자: 2026-08-28
- 대상: DONGLE-FRONT
- 성격: 읽기 전용. 이 보고서 외 소스·문서는 수정하지 않음.
- 기본 경로: `pnpm verify:fast` (`verify:docs` → `verify:vitest-alias` → `turbo type` → `vitest run`)
- 선행 문서: `AGENTS.md`, `docs/evals/README.md`, `docs/evals/success-criteria.md`, `docs/evals/test-inventory.md`, `docs/evals/known-gaps.md`, `docs/evals/roadmap.md`, `docs/evals/infra-assumptions.md`

## 범위

확인한 축:

- 성공 기준 대비 테스트 누락
- 잘못된 assertion
- mock이 가린 회귀
- isolation / flakiness
- Vitest project / `@dongle/*` alias 계약
- `type → test` 순서
- E2E 적정성 (UI 존재 확인용 E2E 증설은 제안하지 않음)
- GitHub PR CI / 배포 gate
- lockfile / build 재현성

한 줄 요약: `pnpm verify:fast`와 frozen-lockfile 설치는 잘 잡혀 있지만, 성공 기준상 가장 위험한 인증·재시도·404 분기는 헬퍼/mock에 가려져 있고 PR CI는 MSW 스모크만, 배포 E2E 게이트는 꺼져 있다.

## P0

### 1. 로그인 action이 테스트되지 않고, 그걸 커버하던 E2E도 CI/배포 게이트에 없음

정확한 위치:

- `apps/DONGLE-ADMIN/src/feature/auth/action/login-form.action.ts:16-75`
- `apps/DONGLE-ADMIN/src/feature/auth/utils/login-form-policy.test.ts:10-41`
- `e2e/admin/auth.spec.ts:8-13`
- `e2e/club/auth.spec.ts:8-12`
- `.github/workflows/main-pr-ci.yml:53-54`
- `.github/workflows/prod-lightsail-deploy.yml:21-71`

영향 / 시나리오:

- `loginFormAction`에 `loginService` 실패, JWT decode 실패, `cookies().set`(httpOnly access/refresh) 분기가 있다.
- 있는 테스트는 username trim / password 원문 보존 / 에러 문구 helper뿐이다.
- 잔존 E2E는 관리자·회장 실제 로그인 연결을 검증하지만 PR CI는 `pnpm test:e2e:smoke`(client `@smoke`)만 실행한다.
- 배포 full E2E는 2026-07-18부터 주석 처리되어 있다.

놓치는 회귀:

- `login_id` 필드명 오기
- JWT 파싱 실패를 성공으로 처리
- 쿠키 `httpOnly` / `maxAge` 누락
- policy 테스트는 통과하고 운영 로그인은 깨짐

최소 수정안:

- `loginFormAction` Vitest를 추가한다. `loginService` / `decodeJwtToken` / `cookies`를 mock한다.
- 성공 시 access·refresh 쿠키 set, decode 실패 시 쿠키 미설정, 서비스 실패 시 `success: false`를 단언한다.
- UI 존재 확인용 E2E를 새로 늘리지 않는다. 기존 auth spec은 환경 안정화 후에만 게이트 후보로 둔다.

테스트·검증 제안:

```bash
pnpm verify:fast
```

해당 테스트는 admin Vitest project에 포함된다.

잔여 리스크:

- 실제 로그인 연결(라우팅·쿠키 전송·실서버)은 unit test만으로는 닫히지 않는다. 기존 auth E2E를 다시 켜기 전에는 운영 로그인 회귀가 배포 게이트를 통과할 수 있다.

### 2. 배포 job `cancel-in-progress: true`

정확한 위치:

- `.github/workflows/prod-lightsail-deploy.yml:9-11`
- symlink 전환: `.github/workflows/prod-lightsail-deploy.yml:274-275`
- healthcheck: `.github/workflows/prod-lightsail-deploy.yml:288-306`

영향 / 시나리오:

- 운영 배포 전체가 concurrency 그룹 `prod-lightsail-deploy`에서 취소된다.
- symlink 전환과 healthcheck 사이에 새 `main` push가 오면 rollback 없이 SSH가 끊긴다.

놓치는 회귀:

- 배포가 성공도 실패도 아닌 상태로 남는다. 테스트로는 잡히지 않는다.

최소 수정안:

- 배포 concurrency는 `cancel-in-progress: false`(또는 queue).
- PR CI 취소(`main-pr-ci.yml:8-10`)는 유지해도 된다.

테스트·검증 제안:

- workflow YAML 리뷰와 배포 재실행 시나리오 확인. 코드 테스트 대상이 아니다.

잔여 리스크:

- queue로 바꾸면 연속 merge 시 배포가 직렬화되어 대기 시간이 길어진다. 취소를 끄지 않으면 부분 적용 리스크가 남는다.

## P1

### 3. 401 재시도는 helper만 검증 — `makeRequest` 루프는 없음

정확한 위치:

- `packages/api/src/make-request.test.ts:4-24`
- `packages/api/src/make-request.ts:91-112`
- `packages/api/src/instance.test.ts:18-22`
- `packages/api/src/instance.ts:7-17`

영향 / 시나리오:

- 성공 기준은 “401이면 갱신 후 1회만 재시도”다.
- 테스트는 `shouldAttemptTokenRefresh` predicate만 검증한다.
- 실제 루프는 `hasRetried: accessTokenOverride !== undefined`다.
- `refreshToken()`이 `{ success: true }`만 주고 `accessToken`이 없으면 override가 `undefined`라 무한 재시도가 가능하다.
- `instance.test.ts`는 `vi.stubGlobal("window", {})`로 클라이언트 모드를 강제해 서버 쿠키/Authorization 경로를 숨긴다.
- `FetchInstance`는 생성 시 `API_URL`을 캡처하는 싱글톤인데, 테스트가 fetch URL을 거의 보지 않는다.

놓치는 회귀:

- refresh 성공이지만 token이 없는 응답에서 재귀가 멈추지 않음
- 서버 경로 Authorization 헤더 누락
- 싱글톤이 빈 `API_URL`로 고정된 뒤 이후 테스트/런타임이 잘못된 baseUrl을 사용

최소 수정안:

- `makeRequest`에 mock `fetch` + `refreshToken` 테스트를 추가한다.
- 401 → refresh 성공 → 원요청 1회
- `skipAuthRefresh`면 refresh 0회
- refresh 성공이지만 token 없음이면 재귀 없음
- fetch URL에 `baseUrl`이 붙는지도 1건

테스트·검증 제안:

```bash
pnpm exec vitest run --project api packages/api/src/make-request.test.ts packages/api/src/instance.test.ts
```

잔여 리스크:

- helper 테스트만 남기면 루프 배선 회귀가 다시 가려진다. instance 싱글톤 리셋이 없으면 테스트 순서에 따른 거짓 통과가 남을 수 있다.

### 4. 활동보고서 상세 404 vs 서버 실패 — 페이지 분기가 테스트 없음

정확한 위치:

- `apps/DONGLE-CLIENT/src/app/clubs/[clubId]/reports/[reportId]/page.tsx:98-107`
- `packages/service/src/club/club.report.service.test.ts:64-84`

영향 / 시나리오:

- 성공 기준: 목록 실패·단건 서버 실패는 404가 아니라 throw, 실제 not found만 `notFound()`.
- 서비스 테스트는 응답을 그대로 돌려줄 뿐, 페이지가 `status === 404`만 `notFound()`로 보내는지는 검증하지 않는다.

놓치는 회귀:

- 목록 실패를 `notFound()`로 바꾸면 5xx가 빈 상세처럼 보인다.

최소 수정안:

- `ClubReportDetailPage`(또는 추출한 resolver)에서 다음을 단언한다.
  - 목록 `isSuccess: false` → throw
  - 단건 `status: 404` → notFound
  - 단건 5xx → throw

테스트·검증 제안:

```bash
pnpm exec vitest run --project client --project service
pnpm verify:fast
```

잔여 리스크:

- 페이지 컴포넌트를 통째로 렌더하지 않고 resolver만 추출하면, `generateMetadata`의 동일 분기(`page.tsx:45-59`)가 어긋나도 놓칠 수 있다.

### 5. 회장 수정 action — 스키마만 있고 실패 시 캐시 무효화 없음이 비어 있음

정확한 위치:

- `apps/DONGLE-ADMIN/src/feature/club/form/club-president.schema.test.ts`
- `apps/DONGLE-ADMIN/src/feature/club/form/club-president.action.ts:47-54`
- 비교 가능한 기존 규약: `apps/DONGLE-ADMIN/src/feature/user/action/change-account-form.action.test.ts:69`

영향 / 시나리오:

- 스키마 테스트는 trim/전화 형식만 있다.
- `submitClubPresidentAction`은 `patchUserService` 실패 시 `revalidateTags`를 건너뛰어야 한다.
- 같은 규약은 계정 변경 action에만 테스트되어 있다.

놓치는 회귀:

- 서비스 실패 전에 태그를 무효화하면 실패한 회장 정보가 캐시에서 사라지거나, 반대로 실패인데 공개 화면 TTL이 리셋된다.

최소 수정안:

- 서비스 실패 → `revalidateTag` 미호출
- 성공 → `user` / `club` tag group 호출
- `change-account-form.action.test.ts`와 같은 패턴

테스트·검증 제안:

```bash
pnpm exec vitest run --project admin apps/DONGLE-ADMIN/src/feature/club/form/club-president.action.test.ts
pnpm verify:fast
```

잔여 리스크:

- schema와 action이 같은 스키마를 쓰는지까지는 이 테스트로 닫히지 않는다. 스키마 테스트는 이미 있으므로 action 배선만 추가하면 된다.

### 6. 홈 배너 필터가 page 테스트 mock에 가려짐 + TZ 미고정

정확한 위치:

- `apps/DONGLE-CLIENT/src/app/page.test.ts:5-8`
- `apps/DONGLE-CLIENT/src/app/home-page-data.ts:28-31`
- `packages/service/src/main-banner/get-display-banner-image-urls.ts:11-14`
- `packages/service/src/main-banner/get-display-banner-image-urls.test.ts:27`

영향 / 시나리오:

- `page.test.ts`가 `getDisplayMainBannerItems`를 identity mock으로 바꾼다.
- `home-page-data.ts`가 이 helper를 빼도 mock이 identity라 테스트는 통과한다.
- helper 자체 테스트는 있지만, `new Date("2026-05-01 00:00:00")`는 로컬 TZ 파싱이다.
- CI(UTC)와 로컬(KST)에서 노출 구간이 달라질 수 있고, 테스트도 TZ를 고정하지 않는다.

놓치는 회귀:

- 홈이 원본 배너 배열을 그대로 노출
- 운영 서버 TZ에 따라 노출 기간이 하루 어긋남

최소 수정안:

- page mock을 실제 함수로 두거나 spy만 사용한다.
- 배너 기간 비교는 Seoul 해석 또는 `TZ=UTC` / `Asia/Seoul` 양쪽 assertion.

테스트·검증 제안:

```bash
pnpm exec vitest run --project client --project service
TZ=UTC pnpm exec vitest run --project service packages/service/src/main-banner/get-display-banner-image-urls.test.ts
TZ=Asia/Seoul pnpm exec vitest run --project service packages/service/src/main-banner/get-display-banner-image-urls.test.ts
```

잔여 리스크:

- helper를 Seoul 해석으로 바꿔도 홈 로더가 helper를 호출하지 않으면 page mock이 identity인 한 다시 가려진다.

### 7. PR `pnpm build` ≠ 운영 standalone 빌드

정확한 위치:

- `.github/workflows/main-pr-ci.yml:12-16` (`NEXT_PUBLIC_USE_MSW: "1"`, `API_URL: https://api.example.com/v1`)
- `.github/workflows/main-pr-ci.yml:47-48` (`pnpm build`)
- `.github/workflows/main-pr-ci.yml:24` (`E2E_SKIP_CLIENT_BUILD: "1"`)
- `.github/workflows/prod-lightsail-deploy.yml:94-119` (`deploy:standalone:prod`, `NODE_ENV=production`, `NEXT_IGNORE_ENV_LOCAL=1`, `PROD_API_URL`)

영향 / 시나리오:

- PR은 MSW가 켜진 상태로 `pnpm build`한 뒤 그 산출물로 client smoke를 돌린다.
- 운영은 standalone prod 빌드와 다른 env/시크릿을 쓴다.

놓치는 회귀:

- MSW 없이만 깨지는 클라이언트 번들/환경 분기
- PR 빌드 통과 ≠ 운영 산출물 검증

최소 수정안:

- PR `pnpm build`에서 `NEXT_PUBLIC_USE_MSW`를 제거하거나 production과 동일한 env를 쓴다.
- 스모크가 MSW가 필요하면 빌드 job과 E2E job을 분리한다.

테스트·검증 제안:

```bash
pnpm verify:fast
pnpm --filter dongle-client build:standalone:prod
```

시크릿 없는 로컬은 env만 대조한다. `pnpm test:e2e:smoke`는 현재 MSW+UI 스모크고 인증 회귀의 대체재가 아니다.

잔여 리스크:

- job을 분리하지 않고 env만 바꾸면 smoke가 실API를 치거나, 반대로 빌드가 계속 MSW를 품을 수 있다.

## P2

### 8. 성공 기준은 있는데 테스트·인벤토리가 비어 있거나 낡음

정확한 위치와 공백:

| 기준 | 위치 | 공백 |
| --- | --- | --- |
| pinch zoom 차단 금지 | `apps/DONGLE-ADMIN/src/app/layout.tsx:23-26` | `userScalable: false` / `maximumScale: 1` 추가를 잡을 테스트 없음 |
| `loading.tsx` 제공 | `apps/DONGLE-CLIENT/src/app/clubs/[clubId]/loading.tsx:1-4`, `apps/DONGLE-CLIENT/src/app/clubs/[clubId]/reports/[reportId]/loading.tsx:1-4` | 스켈레톤 CSS만 봄 (`apps/DONGLE-CLIENT/src/components/loading/page-skeletons.test.tsx:7-13`). 라우트 파일 삭제해도 통과 |
| 배너 내부=같은 탭, 외부=새 탭 | `apps/DONGLE-CLIENT/src/components/main/club-main-hero-banner-carousel.tsx:70-93` | 링크 `target` 테스트 없음 |
| known-gaps 상위 공백 | `docs/evals/known-gaps.md:18-21` | auth redirect, empty-state, payload mapping은 이미 테스트됨. 진짜 공백(로그인 action, 404 분기, makeRequest)이 안 보임 |
| 인벤토리 누락 | `docs/evals/test-inventory.md` | `packages/utils/src/search.test.ts`, `apps/DONGLE-ADMIN/src/app/(대시보드)/(총동연)/admin/(메뉴)/(사용자관리)/user/user-list-view-model.test.ts`, `apps/DONGLE-CLIENT/src/components/club-detail/club-detail-social-info-link.test.tsx` 미기재. `verify:docs`는 A/D/R만 봄 (`scripts/check-doc-contracts.mjs:221-248`) |
| infra vs 실제 verify:fast | `docs/evals/infra-assumptions.md:8` | 문서: docs+type+Vitest. 실제: docs+**alias**+type+test (`package.json:29`) |

영향 / 시나리오:

- 평가 문서가 현재 공백을 가리키지 않으면 에이전트/리뷰어가 이미 닫힌 항목을 쫓고, P0/P1을 놓친다.
- viewport·loading·배너 target은 한 줄 추가로 회귀 가능하다.

최소 수정안:

- 해당 파일에 1~2 assertion을 추가한다.
- `known-gaps.md`를 현재 공백(로그인 action, makeRequest 루프, 보고서 404 분기, 회장 action 캐시, 배너 TZ, PR/배포 게이트)으로 교체한다.
- 인벤토리에 누락 파일을 추가한다.
- `infra-assumptions.md`에 `verify:vitest-alias`를 반영한다.

테스트·검증 제안:

```bash
pnpm verify:docs
pnpm verify:fast
```

잔여 리스크:

- `verify:docs`는 테스트 파일 A/D/R과 인벤토리 동시 변경만 강제한다. 내용 적절성까지는 기계적으로 강제하지 않는다 (`docs/evals/roadmap.md`의 문서 계약 자동화 보류와 일치).

### 9. Vitest project / alias

정확한 위치:

- `vitest.config.ts:4-14`
- `package.json:29`
- `scripts/vitest-alias-contract.mjs:20-53`
- `vitest.workspace-alias.ts`

영향 / 시나리오:

- 루트 project: admin / client / rich-text / ui / utils / api / service / e2e-fixtures.
- `type → test` 순서는 `package.json:29`로 맞다.
- alias는 앱 config만 `createDongleWorkspaceAliases`를 쓴다. 계약 스크립트도 `apps/*/src`만 스캔한다.
- 패키지 테스트의 `@dongle/*`는 pnpm workspace resolve에만 의존한다.
- `@dongle/content`는 alias 목록에 있으나 vitest project는 없다. 테스트가 생기면 `pnpm test`에 안 탄다.

최소 수정안:

- 새 패키지 테스트 추가 시 project를 등록한다.
- alias 계약에 `packages/*/src` include를 검토한다.

테스트·검증 제안:

```bash
pnpm verify:vitest-alias
pnpm test
```

잔여 리스크:

- content/types에 테스트가 생기기 전까지는 실해가 없다. project 누락은 그때 P1이 된다.

### 10. isolation / flake

정확한 위치:

- `apps/DONGLE-ADMIN/src/lib/server/revalidate-tags.test.ts:18-19`, `:63`
- `apps/DONGLE-CLIENT/src/app/api/revalidate/route.test.ts:25-26`
- `e2e/client/search.spec.ts:12-19`, `:22-37`
- `apps/DONGLE-CLIENT/src/hooks/use-club-filters.test.ts`
- `e2e/club/report.spec.ts:7-30`

영향 / 시나리오:

- `process.env = { ...ORIGINAL_ENV }`로 env 객체를 통째로 교체한다. `vi.stubEnv` + `vi.unstubAllEnvs`가 안전하다.
- `revalidate-tags.test.ts:63`은 `setTimeout(0)`으로 음수 단언한다. 간헐적 통과가 가능하다.
- `search.spec.ts`가 `@smoke`라 PR CI에서 debounce+`expect.poll`을 실행한다. URL 파싱은 이미 unit test에 있다. MSW 목록이 비면 `getFirstClubName`이 throw한다.
- `report.spec.ts` afterEach 정리가 예외를 swallow한다. 배포 E2E를 다시 켜면 잔여 데이터로 flake가 난다.

최소 수정안:

- env는 `vi.stubEnv`로 교체한다.
- webhook 미호출 단언은 fake timer 또는 동기 mock으로 바꾼다.
- **새 UI E2E를 늘리지 말고** `search.spec.ts`를 `@smoke`에서 뺀다.
- report E2E 재활성화 전에 cleanup 실패를 실패로 승격하거나 고유 prefix+강제 삭제를 고정한다.

테스트·검증 제안:

```bash
pnpm exec vitest run --project admin --project client
# search.spec.ts를 @smoke에서 뺀 뒤
pnpm test:e2e:smoke
```

잔여 리스크:

- smoke에서 search를 빼도 로컬 `pnpm test:e2e:client`에는 남는다. debounce flake는 로컬/전체 E2E에서 재현될 수 있다.

### 11. lockfile / 재현성

정확한 위치:

- `.github/workflows/main-pr-ci.yml:42`
- `.github/workflows/prod-lightsail-deploy.yml:89`
- `package.json` `packageManager: pnpm@10.28.2`
- CI `PNPM_VERSION: 10.28.2`
- `.node-version` → `22.18.0`
- `turbo.json:8-10`

영향 / 시나리오:

- frozen-lockfile, packageManager, pnpm 버전, Node 버전 pin은 맞다.
- turbo `outputs: [".next/**", ...]`에 `.next/cache`가 포함된다.
- PR 빌드와 운영 `build:standalone:prod`가 다르다 (P1-7).

최소 수정안:

- turbo outputs에서 `.next/cache/**`를 제외한다.
- PR 빌드 env를 운영과 맞춘다.

테스트·검증 제안:

```bash
pnpm install --frozen-lockfile
pnpm verify:fast
pnpm --filter dongle-client build:standalone:prod
```

잔여 리스크:

- 원격 turbo cache가 없어도 로컬 `.next` 재사용으로 환경이 다른 산출물이 남을 수 있다.

## P3

### 12. 약한 assertion과 좁은 성공 경로

정확한 위치:

- `apps/DONGLE-CLIENT/src/components/loading/page-skeletons.test.tsx:10-12` — `not.toContain("border")`, class 문자열. 성공 기준(실화면 구조 반영)과 어긋나면 스타일 리팩터에만 실패한다.
- `apps/DONGLE-ADMIN/src/feature/user/form/user-form.action.test.ts:26-58` — 생성 성공·`role: "admin"`만. 실패 시 태그 미무효화는 없다.
- `apps/DONGLE-ADMIN/src/feature/club/form/club-register.action.test.ts:57-88` — 아이콘 업로드 성공만. 업로드 실패 후 `icon_url` 미저장은 없다.
- `apps/DONGLE-ADMIN/src/feature/feedback/admin-feedback-form.test.ts:19-26` — `toBeDefined()`라 메시지 회귀를 못 잡는다.
- `package.json:29` / PR CI — `pnpm lint`는 `verify:fast`와 PR CI에 없다.
- `e2e/admin/report-management.spec.ts:5-14`, `e2e/client/smoke.spec.ts:5-10` — UI 존재/탭 이동에 가깝다. **증설 제안 없음.** PR에서 게이트할 가치는 auth/제출 E2E보다 낮다.

최소 수정안:

- 스켈레톤은 구조 슬롯(헤더/탭/본문) 존재로 단언을 바꾼다.
- user create / club register 실패 경로에 캐시·업로드 단언을 1건씩 추가한다.
- feedback validation은 메시지 문자열을 단언한다.
- lint를 `verify:fast`에 넣을지는 별도 판단. 타입은 이미 커버한다.

테스트·검증 제안:

```bash
pnpm verify:fast
```

잔여 리스크:

- P3를 먼저 고치면 P0 인증 공백이 그대로 남는다. 우선순위는 P0/P1이다.

## 잘 된 점 (게이트 유지)

- 기본 경로: `pnpm verify:fast` = docs → vitest-alias → `turbo type` → `vitest run`
- 일정 action 실패 시 `revalidateTag` 미호출 (`apps/DONGLE-ADMIN/src/feature/schedule/action/schedule.action.test.ts:109-127` 등)
- 일정/모집 D-day는 `now`를 주입해 flake를 피함
- Playwright spec은 vitest include에서 제외 (`e2e/vitest.config.ts:7`)
- 배포는 frozen-lockfile + verify:fast + health `release` SHA 대조
- 패키지 `type` 스크립트가 apps/packages에 존재하고 turbo `dependsOn: ["^type"]`다

## 권장 최소 작업 순서

1. `loginFormAction` Vitest (P0)
2. `makeRequest` 재시도 루프 Vitest (P1)
3. 보고서 상세 404/throw Vitest (P1)
4. `submitClubPresidentAction` 실패 시 캐시 미무효화 (P1)
5. 배포 concurrency 취소 끄기 (P0 ops)
6. PR 빌드에서 `NEXT_PUBLIC_USE_MSW` 분리 (P1)
7. known-gaps/inventory를 실제 공백에 맞추기 (P2)

UI 존재 확인용 E2E는 추가하지 않는 것이 맞다. `search.spec.ts`를 `@smoke`에서 빼는 것은 감축이지 증설이 아니다.

## 검증 명령

```bash
pnpm verify:fast
pnpm exec vitest run --project api --project admin --project client --project service
```

운영 게이트 재현:

```bash
pnpm --filter dongle-client build:standalone:prod
```

시크릿 없는 로컬은 env만 대조한다. `pnpm test:e2e:smoke`는 현재 MSW+UI 스모크고, 인증 회귀의 대체재가 아니다.

## 잔여 리스크 (종합)

- 로그인 쿠키/JWT 배선, 401 재시도 루프, 보고서 404 분기, 회장 action 캐시는 지금 `pnpm verify:fast`를 통과한 채로 깨질 수 있다.
- PR CI는 MSW 스모크만 게이트하고, 의도적으로 남긴 auth/제출 E2E는 PR에도 배포에도 없다.
- 배포 job 취소와 PR/운영 빌드 env 차이는 테스트 자산 밖의 운영 회귀다.
- 평가 문서(`known-gaps.md`, `test-inventory.md`, `infra-assumptions.md`)가 현재 공백과 어긋나 있어, 후속 작업이 이미 닫힌 항목을 쫓을 수 있다.
- 이 보고서는 문서화만 한다. 위 수정은 적용하지 않았다.

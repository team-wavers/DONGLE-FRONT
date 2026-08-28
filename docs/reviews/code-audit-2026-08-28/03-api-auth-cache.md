# API·인증·캐시 계약 리뷰

- 일자: 2026-08-28
- 범위: 읽기 전용. `packages/api`, `packages/service`, Admin/Client server actions·route handlers
- 추적 대상: 요청/응답 파싱, endpoint/query/body, cookie/session/token refresh, 인증·인가, timeout/retry, 오류 정규화, fetch cache option, cache tag, cross-app revalidation
- 실패 시나리오: HTTP 실패, 네트워크 예외, JSON 불가, 세션 만료, 부분 실패
- 근거 문서: `AGENTS.md`, `docs/evals/README.md`, `docs/evals/success-criteria.md`, `docs/evals/test-inventory.md`, `docs/evals/known-gaps.md`, `docs/evals/roadmap.md`, `docs/architecture/layers.md`, `API.md`
- 제약: 추측·스타일 지적 제외. 코드·문서 미수정.

## 정상으로 확인된 범위

- `packages/api` HTTP 4xx/5xx·JSON 불가 응답은 throw 없이 구조화 실패로 반환한다 (`packages/api/src/instance.ts`, `packages/api/src/parse-json.ts`).
- 공개 GET의 `force-cache` + 도메인별 TTL/tag, 관리 조회 `no-store`는 서비스·테스트와 일치한다.
- `main-banner`/`club-schedule`만 CLIENT webhook, `club`/`report`/`user`는 TTL만 갱신하는 정책은 `apps/DONGLE-ADMIN/src/lib/server/revalidate-tags.ts`와 기준 문서가 일치한다.
- CLIENT `/api/revalidate`는 시크릿 없으면 401, `tags`가 문자열 배열이 아니면 400이다.
- 토큰 갱신 재시도 가드(`401` + `skipAuthRefresh` + 1회)는 helper 단위로 맞다.

## 캐시 정책 추적 결과 (위반 아님)

| 정책 | 코드 | 판정 |
| --- | --- | --- |
| 공개 club/report/schedule/banner `force-cache` + 개별 TTL | `packages/service/src/cache-tags.ts:1-4`, 각 `*.service.ts` | 충족 |
| admin/user `no-store`, tag 없음 | `packages/service/src/club/club.service.ts:23-26`, `packages/service/src/user/user.service.ts:16-18` 등 | 충족 |
| mutation은 cache option 없음, 성공 action만 tag | 생성/수정/삭제 service + `revalidateTags` | 충족 |
| 일정 삭제 전 `club_id` 확인 실패 시 삭제 중단 | `apps/DONGLE-ADMIN/src/feature/schedule/action/schedule.action.ts:290-296` (`getAdminClubScheduleService` throw에 의존) | 동작은 충족, 구현은 P1 throw 계약에 묶임 |
| webhook 실패가 admin action을 실패시키지 않음 | `apps/DONGLE-ADMIN/src/lib/server/revalidate-tags.ts:17-29,37-40` | 충족 |

---

## P0

### 1. 공개 동아리 등록이 로그인 세션을 요구한다

**위치**

- `apps/DONGLE-ADMIN/src/feature/club/form/club-register.action.ts:74-75`
- `apps/DONGLE-ADMIN/src/shared/action/server-action-auth.ts:3-8`
- `apps/DONGLE-ADMIN/src/middleware.ts:8,27-28`
- `apps/DONGLE-ADMIN/src/feature/club/form/use-club-register-form.ts:28-29`

**계약 위반**

- `API.md`: `POST /v1/clubs`는 인증 불필요(일회용 키), `POST /v1/users`도 인증 불필요.
- 미들웨어는 `/club-register`를 public으로 통과시킨다.
- 제품: 관리자는 등록 URL을 발급하고, 수신자가 그 링크로 등록한다.

**영향 / 실패 시나리오**

1. 비로그인 사용자가 `/club-register/:key`에서 제출한다.
2. `requireServerActionAccessToken()`이 쿠키 없음 → `Unauthorized` throw.
3. action은 `sessionExpired: true`를 반환하고, 폼은 `/login?expired=true&returnTo=...`로 보낸다.
4. 회장 계정은 이 action이 성공해야 생성되므로, 대상 사용자는 로그인할 계정이 없다. 등록이 완료되지 않는다.

**최소 수정안**

- `submitClubRegisterAction`에서 `requireServerActionAccessToken()`를 제거한다. 인증은 등록 키(`key`)만 사용한다.
- 실패를 로그인 만료로 매핑하지 않는다.

**테스트·검증 제안**

- `club-register.action.test.ts`: 액세스 토큰 없이 사용자·동아리 생성이 호출되는지.
- 토큰 없음이 `sessionExpired`가 되지 않는지.

---

## P1

### 2. 일정 서비스가 구조화 실패를 throw한다 (레이어 계약 혼용)

**위치**

- `packages/service/src/club/club.schedule.service.ts:86-91`
- 호출: 같은 파일 `94-119`, `122-197`
- 삭제만 Response를 그대로 반환: `146-151`, `200-204`
- Admin RSC: `apps/DONGLE-ADMIN/src/app/(대시보드)/(총동연)/admin/(메뉴)/(일정관리)/schedule/page.tsx:9`
- 회장 RSC: `apps/DONGLE-ADMIN/src/app/(대시보드)/(동아리)/(메뉴)/[clubId]/(일정관리)/schedule/page.tsx:8`

**계약 위반** (`docs/architecture/layers.md`)

- 서비스는 `Response<T>`를 그대로 반환한다.
- HTTP 실패 throw와 `isSuccess` 분기를 한 경로에 섞지 않는다.

**영향 / 실패 시나리오**

- 공개/회장/관리자 일정 GET·생성·수정이 `isSuccess: false`이면 `Error(detail|message)`를 throw한다.
- 네트워크 reject도 같은 throw로 올라간다. HTTP 실패와 구분되지 않는다.
- Admin RSC와 회장 RSC는 catch가 없다. API 실패 시 페이지가 `error.tsx`로 중단된다. 사용자·보고서 목록은 실패/0건을 구분하는 기준이 있다.
- CLIENT 일정 탭/전체 일정은 catch로 `loadFailed`를 만든다. 같은 서비스가 앱마다 다른 실패 모양이 된다.
- 일정 action은 4xx를 catch해 일반 form error로 바꾼다. `sessionExpired`가 붙지 않는다.

**최소 수정안**

- `getResponseResult`를 제거하고 일정 서비스도 `Response<T>`를 반환한다.
- RSC/action에서 `isSuccess`와 네트워크 throw를 분리한다. UI를 깨면 안 되는 조회는 구조화 실패로 정규화한다.

**테스트·검증 제안**

- `club.schedule.service.test.ts`: `isSuccess: false`가 throw가 아니라 실패 응답인지.
- Admin/회장 일정 페이지(또는 view-model): 실패와 빈 목록 구분.
- 일정 action: 서비스 401 → `sessionExpired`, tag 미초기화.

### 3. 미들웨어 토큰 갱신이 `next/headers` `cookies()`에 의존한다

**위치**

- `apps/DONGLE-ADMIN/src/lib/middleware/tokenRefresh.middleware.ts:7-11,43-46`
- `packages/service/src/auth/auth.service.ts:22-33`
- `packages/api/src/make-request.ts:50-55`
- `packages/api/src/utils/cookie/server-cookie.util.ts:1-8,31-33`

**계약 위반**

- 미들웨어는 access 만료 시 refresh로 세션을 이어야 한다 (`apps/DONGLE-ADMIN/src/middleware.ts:39-40`).
- `cookies()`는 Server Component / Server Action / Route Handler용이다. 기본 Edge middleware 컨텍스트가 아니다.

**영향 / 실패 시나리오**

1. access 만료, refresh는 유효하다.
2. `handleTokenRefresh` → `refreshTokenService` → `makeRequest`가 `getAccessTokenFromServerCookie()`를 호출한다. refresh POST 자체는 인증 불필요(`API.md`).
3. `cookies()`가 throw하면 `handleTokenRefresh` catch가 access/refresh 쿠키를 지우고 `/login?expired=true`로 보낸다.
4. 갱신 API는 호출되지 않거나, 호출돼도 실패와 같이 처리된다.

**최소 수정안**

- 미들웨어 refresh는 `request.cookies`의 refresh token만 쓰고, raw `fetch(API_URL/auth/refresh)`로 호출한다. `FetchInstance`/`cookies()`를 쓰지 않는다.
- 응답 쿠키는 지금처럼 `NextResponse.cookies.set`만 사용한다.

**테스트·검증 제안**

- middleware refresh 헬퍼: `next/headers` 없이 401 없는 refresh POST, 성공 시 Set-Cookie.
- `cookies()` throw 시에도 기존 refresh로 갱신을 시도하는지(또는 throw가 로그인 강제 만료가 아닌지).

### 4. 인증 만료가 action마다 다르게 새어 나간다

**위치 (쿠키 없음만 `sessionExpired`)**

- `apps/DONGLE-ADMIN/src/feature/club/form/club-edit.action.ts:108-112`
- `apps/DONGLE-ADMIN/src/feature/club/form/club-president.action.ts:60-64`
- `apps/DONGLE-ADMIN/src/feature/report/form/activity-report.action.ts:77-79`
- `apps/DONGLE-ADMIN/src/feature/report/action/report-action-error-policy.ts:27-33`

**위치 (HTTP 401도 처리)**

- `apps/DONGLE-ADMIN/src/feature/feedback/admin-feedback.action.ts:43-48`

**위치 (둘 다 없음)**

- `apps/DONGLE-ADMIN/src/feature/schedule/action/schedule.action.ts` catch 전 구간
- `apps/DONGLE-ADMIN/src/feature/user/form/user-form.action.ts:43-46,104-107`
- `apps/DONGLE-ADMIN/src/feature/user/action/delete-user.action.ts:32-34`
- `apps/DONGLE-ADMIN/src/feature/main-banner/form/main-banner-form.action.ts:76-79`
- `apps/DONGLE-ADMIN/src/feature/user/action/change-account-form.action.ts:127-131`

**계약 위반**

- 보고서: 인증 만료는 `sessionExpired: true` + form error (`docs/evals/success-criteria.md`).
- 공통 submit runner는 `sessionExpired`만 세션 handler로 넘긴다.
- `requireServerActionAccessToken`은 존재만 보고 만료 JWT는 통과시킨다 (`apps/DONGLE-ADMIN/src/shared/action/server-action-auth.ts:3-8`).

**영향 / 실패 시나리오**

- 쿠키는 있는데 refresh가 실패하면 `packages/api/src/parse-json.ts:35-41`가 `error.status: 401`인 구조화 실패를 반환한다.
- 보고서/동아리 수정은 이를 일반 서비스 실패로 본다. 재로그인 유도가 없다.
- 일정은 throw 메시지로만 실패한다.

**최소 수정안**

- 공통 헬퍼: `error.status === 401` 또는 `Unauthorized` → `sessionExpired: true`.
- 모든 mutating action과 보고서 생성/수정에 적용한다. 피드백과 동일한 분기.

**테스트·검증 제안**

- 보고서: 서비스 401(쿠키 있는 상태) → `sessionExpired`, tag 없음.
- user/schedule/banner/club-edit도 동일 케이스 1개씩.

### 5. 등록 URL 프록시는 만료 access를 갱신하지 않는다

**위치**

- `apps/DONGLE-ADMIN/src/app/api/clubs/registration-urls/route.ts:8-21,39-51`
- `apps/DONGLE-ADMIN/src/middleware.ts:82-84` (`/api` 제외)

**영향 / 실패 시나리오**

- 브라우저 `issueClubRegisterUrlService` → `/api/clubs/registration-urls`.
- 라우트는 쿠키의 access만 붙여 백엔드로 보낸다. 401이어도 refresh 없음.
- JSON이 아니면 `response.json()` throw → 500 합성 실패. 백엔드 401 바디는 유지될 수 있으나 세션 갱신은 없다.
- 같은 앱의 `FetchInstance` 경로와 불일치.

**최소 수정안**

- 이 라우트를 `FetchInstance`/`refreshToken` 경로로 바꾸거나, 401 시 서버 refresh 후 1회 재시도한다. 성공 시에만 새 쿠키를 응답에 심는다.

**테스트·검증 제안**

- access 만료 + refresh 성공 → 백엔드 재호출, 200.
- refresh 실패 → 401 구조화 실패, JSON 파싱 예외 → 합성 실패(throw 없음).

---

## P2

### 6. 동아리 등록 부분 실패: 사용자만 생성되고 롤백 없음

**위치**

- `apps/DONGLE-ADMIN/src/feature/club/form/club-register.action.ts:80-117`

**영향 / 실패 시나리오**

- `createUserService` 성공 후 `createClubService`가 `isSuccess: false`이면 사용자 실패 form error만 반환한다.
- 생성된 president 계정은 남는다. 같은 폼을 다시 내면 다른 `tempId`로 또 사용자를 만든다.

**최소 수정안**

- 클럽 생성 실패 시 생성한 user를 삭제하거나, 클럽 생성 실패 응답에 생성된 `user.id`를 넣어 재시도를 같은 사용자에 묶는다.

**테스트·검증 제안**

- user 성공 + club 실패 → user 삭제 호출(또는 재시도 계약)과 tag 미초기화.

### 7. 이미지 업로드 후 본문 저장 실패 (부분 성공)

**위치**

- `apps/DONGLE-ADMIN/src/feature/report/action/upload-report-images.ts:17-27` (`Promise.all`)
- `apps/DONGLE-ADMIN/src/feature/report/form/activity-report.action.ts:52-70`
- `apps/DONGLE-ADMIN/src/feature/main-banner/form/main-banner-form.action.ts:26-77`

**영향 / 실패 시나리오**

- 이미지 N장 중 일부만 성공해도 `Promise.all`이 전체 throw. 성공분은 S3에 남는다.
- 업로드 성공 후 보고서/배너 생성 실패 시에도 이미지는 남고 DB 레코드는 없다.

**최소 수정안**

- 업로드를 순차로 바꾸고, 하나라도 실패하면 즉시 upload 에러.
- 생성 실패는 이미 있는 upload 실패와 구분된 form error(현재 서비스 분기)를 유지하되, 재제출 시 중복 업로드를 피하려면 성공 URL을 폼에 되돌린다.

**테스트·검증 제안**

- 2장 중 2번째 실패 → upload 에러, createReport 미호출.
- 업로드 성공 + create `isSuccess: false` → tag 없음.

### 8. 리치텍스트 이미지 라우트가 모든 서비스 실패를 HTTP 400으로 덮는다

**위치**

- `apps/DONGLE-ADMIN/src/app/api/clubs/[clubId]/report-images/route.ts:27-30`
- `apps/DONGLE-ADMIN/src/app/api/main-banners/images/route.ts:23-25`
- `packages/api/src/parse-json.ts:35-41` (브라우저가 다시 `status`를 HTTP 상태로 덮어씀)
- `apps/DONGLE-ADMIN/src/shared/ui/form/rich-text-editor/rich-text-editor.tsx:176-186`

**영향 / 실패 시나리오**

- 백엔드 401/404/500이 JSON `error.status`에 있어도 라우트가 HTTP 400을 준다.
- `browserInstance`가 `error.status`를 400으로 바꾼다.
- 에디터는 세션 만료를 구분하지 못하고 일반 업로드 토스트만 보여 준다.

**최소 수정안**

- `response.error.status`가 있으면 그 값을 HTTP status로 쓴다. 없으면 400.
- 에디터는 `status === 401`이면 세션 만료 처리.

**테스트·검증 제안**

- 서비스 401 → 라우트 401, 바디 `error.status === 401`.
- 에디터/브라우저 파서가 401을 유지하는지.

### 9. 2xx인데 JSON이 아니면 성공이 실패로 바뀐다

**위치**

- `packages/api/src/parse-json.ts:16-59`
- `packages/api/src/handle-error-response.ts:93-100`
- `apps/DONGLE-ADMIN/src/app/api/auth/logout/route.ts:6-10`

**영향 / 실패 시나리오**

- 빈 바디·204·HTML 200이면 `response.json()`이 실패하고 `isSuccess: false` 합성이 된다.
- DELETE/로그아웃이 빈 바디면 실제 성공도 실패로 보인다.
- logout 라우트는 백엔드 실패를 무시하므로 로그아웃 UX는 버티지만, 다른 DELETE action은 캐시를 안 지우고 실패를 반환한다.

**최소 수정안**

- 파싱 전 `Content-Length`/`content-type`을 본다. 2xx + 빈 바디는 `{ isSuccess: true, result: null }`로 정규화한다. 4xx/5xx + 비JSON만 기존 합성 실패.

**테스트·검증 제안**

- `packages/api/src/instance.test.ts`: 204 빈 바디 DELETE → 성공. 502 HTML → 합성 실패.

### 10. 계정 변경이 비밀번호 확인을 `loginService`로 한다

**위치**

- `apps/DONGLE-ADMIN/src/feature/user/action/change-account-form.action.ts:82-101,125-135`

**영향 / 실패 시나리오**

- 현재 비밀번호 확인이 `POST /auth/login`이다. 응답 토큰은 쿠키에 쓰지 않는다.
- 백엔드가 로그인 시 기존 refresh를 무효화하면, 이후 요청 401 + refresh 실패로 막 바꾼 계정이 로그아웃된다.
- `getUserService`는 `isSuccess`를 보지 않고 `result`만 본다. 401/5xx도 “사용자 정보를 가져올 수 없습니다.”가 된다.

**최소 수정안**

- 비밀번호 확인 전용 엔드포인트가 없으면, login 성공 시 새 토큰을 쿠키에 반영한다. `getUserService`는 `isSuccess`를 검사한다.

**테스트·검증 제안**

- login 성공 후 쿠키 갱신(또는 확인 API로 교체).
- getUser `isSuccess: false` → 캐시 미초기화.

### 11. `getAdminMainBannerService`만 서비스에서 throw를 삼킨다

**위치**

- `packages/service/src/main-banner/main-banner.service.ts:77-82`

**계약 위반**

- throw → `Response` 정규화는 오케스트레이션 레이어 (`docs/architecture/layers.md`).

**최소 수정안**

- try/catch를 admin 배너 편집 페이지로 옮긴다. 서비스는 `instance.get` 결과를 그대로 반환한다. (단건 예외 정규화 기준은 페이지에서 유지)

**테스트·검증 제안**

- 기존 정규화 테스트를 페이지/loader로 옮긴다.

---

## P3

### 12. transport에 timeout이 없다

**위치**

- `packages/api/src/make-request.ts:91`
- 예외: `apps/DONGLE-ADMIN/src/lib/server/revalidate-tags.ts:25`만 `AbortSignal.timeout(3000)`
- 공개 홈 예외 흡수: `apps/DONGLE-CLIENT/src/app/home-page-data.ts:8-15`

**영향 / 실패 시나리오**

- 행이 걸린 백엔드는 RSC/action을 끝까지 붙잡는다. 문서화된 SLA는 없다. 공개 홈은 `Promise.allSettled`로 예외만 잡는다.

**최소 수정안**

- `makeRequest`에 기본 timeout(예: 10s). Abort는 네트워크 throw로 유지.

**테스트·검증 제안**

- abort 시 reject, JSON 합성 실패가 아님.

### 13. 401 재시도는 helper만 검증한다

**위치**

- `packages/api/src/make-request.test.ts` (실제 `fetch` 재시도 없음)
- 구현: `packages/api/src/make-request.ts:92-111`

**테스트·검증 제안**

- 401 → refresh 성공 → 동일 요청 1회, `Authorization: Bearer <new>`.
- refresh 실패 → 재시도 없음, 원본 401 바디 반환.
- `skipAuthRefresh`면 refresh 호출 없음.

### 14. `handleErrorResponse`는 여전히 throw한다

**위치**

- `packages/api/src/handle-error-response.ts:103-128`
- 사용처: export만 (`packages/api/src/index.ts:4`). 런타임 경로 없음.

**최소 수정안**

- 삭제하거나 미사용 export 제거. 새 코드가 throw 계약으로 되돌아가지 않게.

### 15. FetchInstance 클라이언트 분기는 httpOnly 쿠키와 맞지 않는다

**위치**

- `packages/api/src/make-request.ts:50-55,80-88`
- `packages/api/src/refresh-token.ts:19-25,51-66` (`js-cookie`)
- 로그인/미들웨어는 `httpOnly: true` (`apps/DONGLE-ADMIN/src/feature/auth/action/login-form.action.ts:57-63`, `apps/DONGLE-ADMIN/src/lib/middleware/tokenRefresh.middleware.ts:26-28`)

**영향 / 실패 시나리오**

- 브라우저에서 `FetchInstance`를 쓰면 access를 헤더에 못 붙이고, refresh도 httpOnly refresh를 읽지 못한다. 현재 브라우저 호출은 `BrowserInstance` + 프록시이다.

**최소 수정안**

- 클라이언트 분기·`js-cookie` refresh를 제거하거나, 모든 브라우저 호출이 프록시만 쓰도록 고정한다.

---

## 잔여 리스크

- P0 공개 등록은 비로그인 제출이 원천 차단된다.
- P1 미들웨어 refresh/`cookies()` 결합은 access 만료 시 유효한 refresh를 버려 재로그인을 강제할 수 있다.
- 이 작업은 읽기 전용 리뷰라 `pnpm verify:fast`와 TDD 구현은 하지 않았다.

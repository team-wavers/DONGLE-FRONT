# 보안·개인정보 읽기 전용 리뷰

- 일자: 2026-08-28
- 대상: DONGLE-FRONT (ADMIN, CLIENT, 공유 패키지)
- 방식: 코드·문서 근거만. 운영 콘솔(Sentry/PostHog 프로젝트 설정, 백엔드 인가 실동작)은 추측하지 않음.
- 코드/문서 수정 없음. 본 파일은 감사 결과 기록용.

## 범위

감사 전에 루트 `AGENTS.md`와 `docs/evals` 필수 문서 5종(`README.md`, `success-criteria.md`, `test-inventory.md`, `known-gaps.md`, `roadmap.md`)을 확인했다.

점검 항목:

- Server Action / Route Handler 인증·인가와 입력 검증
- CSRF / 쿠키 (`httpOnly`, `SameSite`, `secure`)
- Open redirect (`returnTo`, 배너 내부 경로)
- XSS / rich text sanitizer
- 외부 URL 정규화 (일정, 지원 링크, SNS, 배너)
- 파일 업로드 (타입·크기, 리치텍스트 본문 이미지, 배너 `imageUrls`)
- SSRF (사용자 입력 URL로 서버 `fetch` 여부)
- secret / `NEXT_PUBLIC_*` 경계
- 보안 헤더
- Sentry / PostHog / 로그 PII

백엔드 서비스는 이 레포에 없다. Next BFF에서 역할·리소스 검사가 없다는 것은 코드 사실이다. 백엔드가 동일 검사를 하면 실제 변조는 막힐 수 있으나, Server Action과 Route는 그대로 공개 엔드포인트다.

## 요약

| 등급 | 건수 | 핵심 |
| --- | --- | --- |
| P0 | 0 | - |
| P1 | 4 | BFF 인가 부재, 임시 비밀번호 URL 노출, 로그인 비밀번호 로그, Sentry PII/쿠키 |
| P2 | 4 | JWT 서명 미검증, 배너 내부경로 오픈리다이렉트, CLIENT 보안 헤더 부재, 업로드 검증 부재 |
| P3 | 3 | revalidate 비교, 헬스/릴리즈 노출, 예시 페이지 |

---

## P0

없음.

---

## P1

### P1-1. Server Action·업로드 Route에 역할/리소스 인가가 없고, `/api`는 미들웨어에서도 빠져 있다

**위치**

- `apps/DONGLE-ADMIN/src/shared/action/server-action-auth.ts:3-10`
- `apps/DONGLE-ADMIN/src/feature/user/form/user-form.action.ts:33-41` (`role: "admin"` 고정 생성)
- `apps/DONGLE-ADMIN/src/feature/user/action/delete-user.action.ts:13-30`
- `apps/DONGLE-ADMIN/src/feature/club/action/delete-club.action.ts:16-20`
- `apps/DONGLE-ADMIN/src/feature/club/form/club-edit.action.ts:37-63`
- `apps/DONGLE-ADMIN/src/feature/club/form/club-president.action.ts:13-45` (호출자가 넘긴 `presidentId`)
- `apps/DONGLE-ADMIN/src/feature/main-banner/form/main-banner-form.action.ts:61-62`
- `apps/DONGLE-ADMIN/src/feature/schedule/action/schedule.action.ts:53-76`
- `apps/DONGLE-ADMIN/src/app/api/clubs/[clubId]/report-images/route.ts:4-30`
- `apps/DONGLE-ADMIN/src/app/api/main-banners/images/route.ts:4-25`
- `apps/DONGLE-ADMIN/src/middleware.ts:67-79, 82-83`
- `packages/api/src/browser-instance.ts:3-7` (프록시가 인증을 처리했다는 전제와 불일치)

**공격 전제**

유효한 회장(또는 일반 로그인) 세션 쿠키. 페이지 가드(`/admin`)를 우회해 Server Action ID 또는 `/api/...`를 직접 호출할 수 있음.

**악용 경로**

1. 미들웨어는 `/admin`만 역할 검사하고, `/{clubId}/...`는 JWT만 있으면 통과한다 (`middleware.ts:78-79`). 경로 `clubId`와 토큰 `club_id`를 비교하지 않는다.
2. matcher가 `api`를 제외하므로 (`middleware.ts:82-83`) `/api/main-banners/images`, `/api/clubs/{임의의 clubId}/report-images`는 로그인 UI 가드를 타지 않는다. 라우트 자체에도 `getAccessTokenFromServerCookie` 검사가 없다.
3. 모든 변경 Server Action은 `requireServerActionAccessToken()`만 호출한다. 토큰 존재만 확인하고 `role`/`club_id`를 보지 않는다. 회장 세션으로 `submitUserCreateAction` (관리자 생성), `deleteUserAction`, `deleteClubAction`, `submitMainBannerCreateAction`, 다른 `clubId`의 수정/업로드를 호출할 수 있다.

**영향**

Next BFF에서 권한 경계가 없다. 백엔드가 거부하지 않으면 관리자 생성·사용자/동아리 삭제·배너 변조·타 동아리 업로드가 성립한다. 업로드 라우트는 주석과 달리 인증을 강제하지 않는다.

**최소 완화책**

- `requireServerActionAccessToken`을 역할·리소스 가드로 확장하고, 관리자 전용 액션은 `ADMIN`, 동아리 액션은 JWT `club_id`와 인자 `clubId` 일치(관리자는 예외)를 강제한다.
- `/api/clubs/[clubId]/report-images`, `/api/main-banners/images`에 동일한 인가를 넣고, matcher에서 `api`를 빼지 않거나 라우트에서 쿠키를 검사한다.
- 미들웨어에서 `/{clubId}`와 토큰 `club_id`를 바인딩한다.

**회귀 테스트**

- 회장 토큰으로 `submitUserCreateAction` / `deleteClubAction` / `submitMainBannerCreateAction`이 서비스 호출 전에 실패하는지.
- 회장 토큰의 `club_id=1`로 `clubId=2` edit/upload/schedule이 거부되는지.
- 쿠키 없이 업로드 Route가 401인지.
- 미들웨어가 다른 동아리 경로를 거절하는지.

---

### P1-2. 신규 회장 임시 아이디·비밀번호가 공개 경로 쿼리에 실린다

**위치**

- `apps/DONGLE-ADMIN/src/feature/club/form/club-register.action.ts:24-28, 76-77, 152-157`
- `apps/DONGLE-ADMIN/src/feature/club/form/use-club-register-form.ts:33-43`
- `apps/DONGLE-ADMIN/src/app/(대시보드)/(동아리)/club-register/register-success/page.tsx:24-29, 144-145`
- `apps/DONGLE-ADMIN/src/middleware.ts:8` (`/club-register`가 `PUBLIC_ROUTES`)

**공격 전제**

동아리 등록이 한 번 성공했거나, `?data=`가 붙은 성공 URL을 알 수 있음 (히스토리, 서버 액세스 로그, 공유, Referer).

**악용 경로**

1. 등록 성공 시 클라이언트가 `tempId`/`tempPassword`를 `btoa`한 뒤 `/club-register/register-success?data=...`로 보낸다.
2. 해당 경로는 미들웨어에서 공개다. 로그인 없이 URL만 있으면 평문 비밀번호가 화면에 나온다.
3. `tempPassword`는 `tempId`와 같고 (`dongle` + 6자리), 인코딩은 난독화이지 비밀이 아니다.

**영향**

신규 회장 계정 탈취. 비밀번호 변경 전까지 해당 동아리 관리 권한이 넘어간다.

**최소 완화책**

- 쿼리/히스토리에 비밀번호를 넣지 않는다. 한 번만 보여주는 서버 세션 플래시 또는 POST-redirect 후 메모리 표시.
- 성공 페이지를 인증된 관리자만 보게 하고, 임시 비밀번호는 최초 로그인 강제 변경과 함께 짧은 TTL로 발급한다.

**회귀 테스트**

- 등록 성공 이동 URL에 `tempPassword`/`data=`가 없는지.
- 비로그인으로 `/club-register/register-success?data=...`가 비밀번호를 렌더하지 않는지.

---

### P1-3. 실패 API 응답이 로그인 비밀번호를 포함한 `requestPayload`를 로그에 남긴다

**위치**

- `packages/api/src/parse-json.ts:19-33`
- 호출 예: `apps/DONGLE-ADMIN/src/feature/auth/action/login-form.action.ts:29-32`
- `apps/DONGLE-ADMIN/src/feature/user/action/change-account-form.action.ts:92-95`

**공격 전제**

잘못된 비밀번호 로그인 또는 계정 변경 시 현재 비밀번호 확인 실패. 서버/컨테이너 로그 또는 로그 파이프라인 접근.

**악용 경로**

1. `loginService({ login_id, password })`가 `isSuccess: false` JSON을 반환한다.
2. `parseJsonOrSynthetic`이 throw하지 않고 `console.error("error response:", { body, url, method, requestPayload })`를 찍는다.
3. `requestPayload`는 `{ login_id, password }` 원문이다.

**영향**

비밀번호·로그인 ID가 애플리케이션 로그에 남는다. 로그 수집 시스템이 있으면 제3자 처리자로도 유출될 수 있다.

**최소 완화책**

- `requestPayload` 전체를 로그하지 않는다. 키 목록만 남기거나 인증 필드를 제거한다 (`handle-error-response.ts`의 `summarizeRequestPayload` 패턴).
- `login_id`/`password`/`phone`은 서버 로그·Sentry extra에서 제외한다.

**회귀 테스트**

- `isSuccess: false` 경로에서 `console.error` 인자에 `password`가 없는지.
- `loginFormAction` 실패 시 로그 스파이로 비밀번호 부재를 단언.

---

### P1-4. Sentry `sendDefaultPii: true`와 extra로 식별자·요청 맥락이 나간다

**위치**

- `apps/DONGLE-ADMIN/instrumentation-client.ts:12-14`
- `apps/DONGLE-ADMIN/sentry.server.config.ts:11`
- `apps/DONGLE-ADMIN/sentry.edge.config.ts:11`
- `apps/DONGLE-CLIENT/instrumentation-client.ts:14`
- `apps/DONGLE-CLIENT/sentry.server.config.ts:11`
- `apps/DONGLE-CLIENT/sentry.edge.config.ts:11`
- `apps/DONGLE-ADMIN/src/feature/user/form/user-form.action.ts:55-58` (`login_id`)
- `apps/DONGLE-ADMIN/src/feature/club/form/club-register.action.ts:168-170` (`registrationKey`)
- `apps/DONGLE-ADMIN/src/lib/sentry/capture-server-exception.ts:6-16`

**공격 전제**

Sentry DSN이 켜진 환경에서 오류가 발생함. (콘솔 설정은 보지 않음. SDK 플래그만 근거로 함.)

**악용 경로**

1. `sendDefaultPii: true`는 SDK가 IP, 요청 헤더/쿠키를 기본 수집하도록 켠다. 서버 이벤트에는 `accessToken`/`refreshToken` 쿠키가 포함될 수 있다.
2. `captureServerException`이 `extra`로 `login_id`, `registrationKey`를 붙인다.
3. 클라이언트 Replay는 `maskAllText: true`이나, PII 기본 전송과는 별개다.
4. 개인정보처리방침은 Sentry에 “IP 등 기술 정보”만 적고 세션 쿠키·로그인 ID는 적지 않는다 (`packages/content/src/privacy-policy.tsx` 위탁 표).

**영향**

세션 토큰·계정 식별자가 국외 오류 모니터링으로 이전될 수 있다. Sentry 접근 권한이 있는 내부자/수탁자 범위의 세션 남용 위험이 생긴다.

**최소 완화책**

- `sendDefaultPii: false`. 서버 `beforeSend`에서 `Cookie`/`Authorization` 제거.
- extra에서 `login_id`/`registrationKey`/토큰을 뺀다.
- 방침 문구와 실제 전송 항목을 맞춘다.

**회귀 테스트**

- Sentry init 스냅샷에 `sendDefaultPii: false`.
- `captureServerException` extra에 `login_id`/`password`/`registrationKey`가 없는지.

---

## P2

### P2-1. 미들웨어 인가가 JWT 서명을 검증하지 않는다

**위치**

- `packages/api/src/utils/jwt.util.ts:19-21` (`decodeJwt`만 사용)
- `apps/DONGLE-ADMIN/src/middleware.ts:39-46, 67-76`

**공격 전제**

공격자가 `accessToken` 쿠키를 직접 설정할 수 있음 (브라우저).

**악용 경로**

만료되지 않은 페이로드에 `role: admin`을 넣은 위조 JWT를 쿠키로 넣으면, 미들웨어는 서명 없이 `/admin`을 통과시킨다. 이후 데이터 조회는 백엔드 Bearer 검증에 달림.

**영향**

관리자 셸/라우트 구조 노출. 백엔드가 막으면 데이터 유출은 제한적이다. UI 가드만으로는 인가가 성립하지 않는다.

**최소 완화책**

미들웨어는 서명 검증된 토큰만 신뢰하거나, 역할 가드를 서버 컴포넌트/액션의 검증된 클레임에만 둔다. `decodeJwt`를 인가에 쓰지 않는다.

**회귀 테스트**

서명 없는/위조 JWT로 `/admin` matcher가 통과하지 않는지 (jwks/secret 픽스처).

---

### P2-2. 배너 “내부 경로”가 `//`만 거절해 `/\` 오픈리다이렉트가 남는다

**위치**

- `packages/service/src/main-banner/get-display-banner-image-urls.ts:22-24`
- `apps/DONGLE-CLIENT/src/components/main/club-main-hero-banner-carousel.tsx:71-93`
- 대조: `apps/DONGLE-ADMIN/src/feature/auth/utils/normalize-internal-return-to.ts:9-26` (URL 파서로 pathname 재구성)

**공격 전제**

배너 `link_url`을 `/\evil.example` 형태로 저장할 수 있는 관리자(또는 P1-1로 배너 액션을 호출할 수 있는 세션).

**악용 경로**

1. `startsWith("/") && !startsWith("//")`는 `/\evil.example`을 내부 링크로 통과시킨다.
2. 캐러셀은 `startsWith("/")`이면 same-tab `Link`로 렌더한다.
3. 일부 브라우저/Next `Link`는 역슬래시를 `/`로 취급해 외부로 나간다. `javascript:`/`//`는 테스트로 거절하지만 역슬래시는 없다.

**재현 (Node URL 파서, 2026-08-28)**

- `new URL("/\\evil.com", "http://localhost")` → `href: "http://evil.com/"`, `host: "evil.com"`
- `normalizeDisplayBannerLinkUrl`과 동일한 분기는 `"/\\evil.com"`을 그대로 반환한다.
- `javascript:alert(1)`과 `//evil.com`은 `null`이다.
- `returnTo`의 `isAllowedInternalReturnPath`는 같은 역슬래시 입력을 허용한다. 다만 `normalizeInternalReturnTo`는 pathname만 쓰므로 결과는 `/`로 떨어져 외부 이동으로는 이어지지 않는다.

**영향**

사용자 메인 배너 클릭으로 피싱 사이트로 이동. `returnTo`는 URL 파서로 pathname만 써서 이 우회가 상대적으로 약하다.

**최소 완화책**

내부 링크도 `new URL(value, origin)` 후 `origin` 일치와 `pathname.startsWith("/") && !pathname.startsWith("//")`만 허용. `\` 포함 경로 거부.

**회귀 테스트**

`normalizeDisplayBannerLinkUrl("/\\evil.example")`, `"/%5C%5Cevil.example"` → `null`.

---

### P2-3. CLIENT 앱에 보안 헤더가 없고, ADMIN도 CSP/Referrer-Policy가 없다

**위치**

- `apps/DONGLE-CLIENT/next.config.ts` — `headers()` 없음
- `apps/DONGLE-ADMIN/next.config.ts:65-85` — HSTS, `X-Frame-Options`, `X-Content-Type-Options`만 있음

**공격 전제**

클릭재킹, MIME sniffing, Referer로 쿼리 유출(P1-2와 결합).

**악용 경로**

CLIENT는 iframe 삽입·sniffing 완화가 코드에 없다. ADMIN도 `Referrer-Policy`가 없어 성공 URL의 `data=`가 외부 요청 Referer로 나갈 수 있다.

**영향**

클릭재킹·Referer 기반 자격 증명 부가 유출. CSP 부재는 rich text XSS 방어를 DOMPurify에만 맡긴다.

**최소 완화책**

양 앱에 ADMIN과 동일한 기본 헤더 + `Referrer-Policy: strict-origin-when-cross-origin`(또는 `no-referrer`) + 점진적 CSP.

**회귀 테스트**

`next.config` headers 스냅샷 또는 라우트 응답 헤더 단언.

---

### P2-4. 파일 업로드 타입/크기 검증이 클라이언트에만 있고, 리치텍스트 업로드는 그마저도 없다

**위치**

- `apps/DONGLE-ADMIN/src/shared/ui/form/file-upload/file-upload.tsx:51-66` (브라우저 `file.type`만)
- `apps/DONGLE-ADMIN/src/shared/ui/form/rich-text-editor/rich-text-editor.tsx:159-176` (타입/크기 검사 없음)
- `apps/DONGLE-ADMIN/src/app/api/clubs/[clubId]/report-images/route.ts:11-27` (`File` 여부만)
- `apps/DONGLE-ADMIN/src/feature/report/action/upload-report-images.ts:10-11` (`size > 0`만)
- `apps/DONGLE-ADMIN/src/feature/main-banner/form/main-banner-form.action.ts:40-43` (`imageUrls[0]` 임의 문자열 허용)

**공격 전제**

인증된 업로드 호출(또는 P1-1). MIME는 클라이언트가 위조 가능.

**악용 경로**

리치텍스트는 선택한 파일을 그대로 POST한다. 라우트는 매직바이트/허용 MIME/상한을 보지 않는다. 배너 수정은 새 파일 없이 `imageUrls[0]`을 그대로 `image_url`로 저장한다.

**영향**

SVG/HTML 업로드 후 저장된 URL이 스크립트 가능한 타입으로 서빙되면 XSS. 대용량 업로드로 스토리지/백엔드 부하. 배너에 비허용 호스트 URL 저장.

**최소 완화책**

서버에서 허용 MIME(매직바이트), 확장자 화이트리스트, 크기 상한. 리치텍스트도 동일. `image_url`/`icon_url`은 허용 CDN 호스트만.

**회귀 테스트**

`text/html`·`image/svg+xml`·과대 파일이 라우트/액션에서 400인지. 배너 `imageUrls: ["javascript:alert(1)"]` 거부.

---

## P3

### P3-1. `/api/revalidate` 시크릿이 상수시간 비교가 아니다

**위치:** `apps/DONGLE-CLIENT/src/app/api/revalidate/route.ts:8-12`

**공격 전제:** `REVALIDATE_SECRET` 길이/값을 알고 네트워크 타이밍을 관측.

**악용 경로:** `x-revalidate-secret` 바이트 단위 비교로 타이밍 차이.

**영향:** 시크릿 전수에 이론적 도움. 캐시 무효화 DoS.

**최소 완화책:** `crypto.timingSafeEqual` + 길이 가드. 태그 화이트리스트.

**회귀 테스트:** 불일치/길이 불일치 모두 401, `revalidateTag` 미호출.

---

### P3-2. 헬스 체크가 릴리즈 식별자를 노출한다

**위치:** `apps/DONGLE-CLIENT/src/app/api/health/route.ts:6-10`, `apps/DONGLE-ADMIN/src/app/api/health/route.ts:6-10`

**공격 전제:** 엔드포인트가 공개 라우팅됨.

**영향:** 배포 버전 정찰.

**최소 완화책:** 인증된 프로브만 `release`를 반환하거나 내부망에서만 노출.

**회귀 테스트:** 공개 헬스 응답에 `SENTRY_RELEASE`가 없는지, 또는 인증 없이 호출 시 `ok`만 반환하는지.

---

### P3-3. 비프로덕션 Sentry 예시 페이지가 공개 라우트다

**위치:** `apps/DONGLE-ADMIN/src/middleware.ts:8`, `apps/DONGLE-ADMIN/src/app/sentry-example-page/page.tsx:4-6`, CLIENT 동일

**공격 전제:** `SENTRY_ENVIRONMENT !== "production"`.

**영향:** 인증 없이 테스트 오류 주입·쿼터 소모.

**최소 완화책:** 예시 라우트를 빌드에서 제거하거나 내부 인증 뒤에 둔다.

**회귀 테스트:** 비프로덕션에서도 비로그인 접근이 404이거나 인증을 요구하는지.

---

## 코드로 취약점으로 보지 않은 것

- **Open redirect `returnTo`:** protocol-relative·인코딩 우회 테스트가 있고, URL 파서로 pathname을 재구성한다. 역슬래시 입력은 허용 분기를 통과할 수 있으나 최종 이동은 pathname `/`로 떨어진다.
- **일정의 `javascript:` URL:** `normalizeExternalUrl`이 http(s)만 허용하고 credential URL을 거절한다.
- **Rich text 렌더 XSS:** 뷰어가 DOMPurify를 쓰고, 로드 실패 시 빈 문자열을 반환한다. 저장 시 서버 sanitize는 없다(잔여 리스크, 현재 뷰어가 막음).
- **PostHog 이벤트 PII:** 허용 키 화이트리스트, autocapture/session replay 비활성, 전화번호 속성 제거 테스트가 있다.
- **SSRFable user URL fetch:** 사용자 URL로 서버 `fetch`하는 코드는 없다. `CLIENT_BASE_URL`/`API_URL`은 env다.
- **로그인 쿠키:** 서버 로그인 경로는 `httpOnly` + `SameSite=lax` + 프로덕션 `secure`다. (클라이언트 `js-cookie` 갱신 분기는 FetchInstance가 브라우저 서비스 호출로 쓰이지 않아 본 경로의 주 위험으로 보지 않음.)

---

## 잔여 리스크

- 백엔드 JWT 인가·업로드 MIME·로그 파이프라인·Sentry 프로젝트 스크러빙은 이 레포만으로 확인할 수 없다.
- P1-1의 실제 데이터 변조 여부는 백엔드 인가에 달려 있다.
- Rich text는 저장 시점 서버 sanitize가 없어, 향후 sanitizer를 거치지 않는 렌더 경로가 생기면 stored XSS가 된다.
- 이 작업은 읽기 전용 감사여서 코드 수정과 `pnpm verify:fast`는 수행하지 않았다.

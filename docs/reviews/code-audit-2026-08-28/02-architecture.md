# 아키텍처·모듈 설계 읽기 전용 리뷰

날짜: 2026-08-28  
대상: DONGLE-FRONT  
관점: codebase-design의 Module, Interface, Seam, Adapter, Depth, Leverage, Locality  
작성 방식: 읽기 전용. 소스와 다른 문서는 수정하지 않음.

## 범위

확인한 문서:

- 루트 `AGENTS.md`
- `docs/evals/README.md`
- `docs/evals/success-criteria.md`
- `docs/evals/test-inventory.md`
- `docs/evals/known-gaps.md`
- `docs/evals/roadmap.md`
- `docs/architecture/layers.md`

확인한 코드 범위:

- `apps/*` ↔ `packages/*` 의존 방향
- `@dongle/service` / `@dongle/api` 오류 seam
- 일정·배너·URL 공용 모듈
- `cached-services` pass-through
- shallow/pass-through module, 중복, 공용 패키지 책임, 테스트 가능성, AI 탐색성

제외:

- 과도한 추상화 제안
- 스타일 취향

패키지 방향 자체는 건전하다. `apps → service → api → types`, `apps → ui → utils`이고 역방향 import는 없다. 아래는 그 위에서 실제로 회귀·유지보수를 흔드는 seam 문제다.

P0 발견사항은 없다.

---

## P1. `@dongle/service` 오류 계약이 모듈마다 다름

### 위치

- `packages/service/src/club/club.schedule.service.ts:86-91` `getResponseResult` — `isSuccess: false`를 throw
- 같은 파일 `:94-99`, `:112-119`, `:122-127`, `:174-178` — GET/POST/PATCH가 `T`를 반환
- 같은 파일 `:146-151`, `:200-204` — DELETE만 `Response`를 그대로 반환
- `packages/service/src/club/club.service.ts:38-43`, `packages/service/src/club/club.report.service.ts:53-63` — `Response<T>` 통과
- `packages/service/src/main-banner/main-banner.service.ts:57-82` — throw를 `isSuccess: false`로 삼킴 (`error.status` 없음)

### 영향 / 시나리오

- throw를 안 잡는 RSC: `apps/DONGLE-ADMIN/src/app/(대시보드)/(동아리)/(메뉴)/[clubId]/(일정관리)/schedule/page.tsx:8-9`, `apps/DONGLE-ADMIN/src/app/(대시보드)/(총동연)/admin/(메뉴)/(일정관리)/schedule/page.tsx:9`
- throw를 잡는 CLIENT: `apps/DONGLE-CLIENT/src/app/clubs/[clubId]/page.tsx:65-83`, `apps/DONGLE-CLIENT/src/app/schedules/page.tsx:27-32`
- 한 action 안에서 계약이 갈림: `apps/DONGLE-ADMIN/src/feature/schedule/action/schedule.action.ts:76` (생성은 unwrap된 `result.id`) vs `:224-226` (삭제는 `result.isSuccess`)
- 배너 편집은 Response 분기: `apps/DONGLE-ADMIN/src/app/(대시보드)/(총동연)/admin/(메뉴)/(메인배너관리)/banner/[id]/edit/page.tsx:10-17`

### 근거

`docs/architecture/layers.md`는 서비스가 `Response<T>`를 그대로 두고, `isSuccess` 정책은 오케스트레이션에 두라고 못 박는다. 지금 `@dongle/service` Interface는 세 가지다. 같은 이름의 `*Service`를 복사하면 회장/관리자 일정 페이지는 구조화 실패 때 `error.tsx`로 떨어지고, CLIENT만 실패 UI가 된다. 생성 서비스를 Response로 “맞추면” `result.id`가 사라져 태그 무효화 범위가 틀어진다. `club.schedule.service.test.ts`는 성공 경로만 고정해서 이 계약을 잠그지 않는다.

### 최소 수정안

일정 서비스도 클럽/보고서처럼 `Response<T>`만 반환하게 맞춘다. `getResponseResult`와 DELETE 예외를 없앤다. throw 정규화는 page/action에만 둔다. 배너 단건 catch도 오케스트레이션으로 올린다.

### 테스트·검증 제안

`packages/service/src/club/club.schedule.service.test.ts`에 `isSuccess: false`가 throw가 아니라 실패 응답인 케이스를 추가한다. `schedule.action.test.ts`의 생성/삭제 실패·태그 미초기화를 그대로 통과시키는지 확인한다. `pnpm verify:fast`.

---

## P1. 배너 노출 기간이 Seoul datetime seam을 우회함

### 위치

- `packages/service/src/main-banner/get-display-banner-image-urls.ts:11-14` — `new Date(publish_start_at/end_at)`
- 호출: `apps/DONGLE-CLIENT/src/app/home-page-data.ts:28-31` (`now` 미전달, RSC)

### 영향 / 시나리오

메인 홈 배너. 일정은 이미 `getDateTimeTimestamp(..., { timeZone: "Asia/Seoul" })`를 쓴다 (`apps/DONGLE-CLIENT/src/lib/club-schedule.ts:12-14`, `apps/DONGLE-ADMIN/src/feature/schedule/schedule.utils.ts:219-221`).

서버 TZ가 UTC면 timezone 없는 `YYYY-MM-DD HH:mm:ss` 배너 기간이 UTC로 파싱되어, 서울 기준 시작 9시간이 숨겨지거나 종료가 9시간 늘어난다.

### 근거

성공 기준은 timezone 없는 서버 datetime을 Seoul로 해석하라고 한다. 배너 값은 `YYYY-MM-DD HH:mm:ss`다. 테스트는 `new Date("2026-05-10T12:00:00")`를 같은 로컬 TZ로 넣어 이 차이를 못 잡는다. datetime 정책이 `@dongle/utils` Interface 밖에 하나 더 있다.

### 최소 수정안

`isInPublishPeriod`를 `getDateTimeTimestamp`로 바꾼다. 테스트에 UTC 호스트와 Seoul naive 문자열 조합을 넣는다.

### 테스트·검증 제안

`TZ=UTC`에서 `get-display-banner-image-urls.test.ts`가 서울 자정~23:59 경계를 통과하는지 확인한다. `pnpm verify:fast`.

---

## P2. 저장용 SNS URL 정책이 `@dongle/ui` Interface 뒤에 있음

### 위치

- 구현: `packages/ui/src/utils.ts:137-143` (`normalizeSocialUrl`, 같은 파일에 `cn`·날짜 래퍼)
- 저장 경로: `apps/DONGLE-ADMIN/src/feature/club/form/club-register.action.ts:30-34`, `apps/DONGLE-ADMIN/src/feature/club/form/club-edit-payload.ts:10-11`
- 표시 경로: `apps/DONGLE-CLIENT/src/app/clubs/[clubId]/page.tsx:137-138`
- 테스트는 CLIENT에만 있음: `apps/DONGLE-CLIENT/src/lib/normalize-social-url.test.ts`

### 영향 / 시나리오

다른 도메인 입력은 `https://www.instagram.com/`으로 바뀌어 **저장**된다. UI 유틸 수정이 동아리 payload를 바꾼다. 테스트 표면이 CLIENT라 ADMIN 저장 회귀를 UI 정리로 오인하기 쉽다.

### 근거

삭제 테스트상 로직은 필요하지만, seam이 UI가 아니다. payload-critical 정책이 표시용 패키지 Interface 뒤에 있다.

### 최소 수정안

함수를 `@dongle/utils`로 옮기고 ADMIN payload 테스트가 그 Interface를 직접 호출하게 한다. `@dongle/ui`는 re-export만 두거나 호출부를 utils로 바꾼다.

### 테스트·검증 제안

기존 `normalize-social-url.test.ts`와 `club-register.action.test.ts` / `club-edit-payload` 테스트를 `pnpm verify:fast`로 돌린다.

---

## P2. 월간 캘린더 격자·날짜 포함 로직이 ADMIN/CLIENT에 복제됨

### 위치

- 42칸 격자: `apps/DONGLE-ADMIN/src/feature/schedule/schedule.utils.ts:36-46` vs `apps/DONGLE-CLIENT/src/lib/public-schedule-calendar.ts:56-69`
- 날짜 포함: ADMIN `schedule.utils.ts:52-60` (Seoul `YYYY-MM-DD` 폐구간) vs CLIENT `public-schedule-calendar.ts:71-85` (timestamp 구간 겹침)

### 영향 / 시나리오

관리자 일정 대시보드, 사용자 `/schedules` 캘린더. 성공 기준은 양쪽 모두 6주 격자와 복수일 표시다. 종료 시각이 `00:00:00`이거나 주 시작을 바꾸면 한쪽만 고치기 쉽다.

### 근거

같은 제품 규칙이 다른 원시값으로 구현되어 있다. display helper는 `@dongle/ui`에 모였지만, 캘린더 포함 판정은 그렇지 않다.

### 최소 수정안

격자 생성과 “이 날짜에 일정이 걸치는가”만 `@dongle/utils` 또는 기존 `schedule-display` 옆에 한 Interface로 올린다. ADMIN/CLIENT는 화면 모델 매핑만 남긴다.

### 테스트·검증 제안

`schedule.utils.test.ts`의 복수일·월말 케이스와 `public-schedule-calendar.test.ts`를 같은 입력으로 맞춘다. `pnpm verify:fast`.

---

## P2. `@dongle/api` 공개 Interface에 죽은 throw 계약이 남아 있음

### 위치

- `packages/api/src/index.ts:4` — `handleErrorResponse` export
- `packages/api/src/handle-error-response.ts:103-128` — HTTP 실패를 throw
- 실제 transport: `packages/api/src/make-request.ts:114-122` + `instance.ts`의 `parseJsonOrSynthetic` (throw하지 않음)

### 영향 / 시나리오

런타임 호출자는 없다. 호출 가능한 공개 Interface다. barrel만 보고 HTTP 실패를 다시 throw에 연결하면 P1 혼합 계약이 재도입된다.

### 근거

레이어 문서의 transport 계약과 정반대다. Adapter가 하나인 가상 seam이 공개되어 있다.

### 최소 수정안

`index.ts`에서 제거하고, 필요하면 내부 전용으로 내린다.

### 테스트·검증 제안

`packages/api/src/instance.test.ts`, `make-request.test.ts`가 4xx를 구조화 실패로 유지하는지 확인한다. `pnpm verify:fast`.

---

## P3. `cached-services`가 cache하지 않는 서비스를 같은 이름으로 재export

### 위치

- `apps/DONGLE-ADMIN/src/lib/server/cached-services.ts:21`
- `apps/DONGLE-CLIENT/src/lib/server/cached-services.ts:19`

### 영향 / 시나리오

CLIENT 보고서 상세는 같은 요청에서 `getClubReportService`를 metadata와 page가 각각 호출한다 (`apps/DONGLE-CLIENT/src/app/clubs/[clubId]/reports/[reportId]/page.tsx:42`, `:83`). ADMIN 보고서 상세·배너 단건도 이 경로다. 호출자는 캐시된다고 가정하고 중복 fetch를 넣기 쉽다.

### 근거

모듈 이름이 request dedup Interface인데, 일부는 `cache()`이고 일부는 pass-through다.

### 최소 수정안

`getClubReportService` / `getAdminMainBannerService`도 `cache()`로 감싸거나, 미감싼 심볼은 `@dongle/service`에서 직접 import하게 이름을 분리한다.

### 테스트·검증 제안

해당 page의 단건 조회가 요청당 한 번인지 테스트 또는 로그로 확인한다.

---

## P3. 동일한 `ClientRichTextViewer`가 앱에 두 벌

### 위치

- `apps/DONGLE-ADMIN/src/shared/ui/rich-text/client-rich-text-viewer.tsx:1-40`
- `apps/DONGLE-CLIENT/src/components/rich-text/client-rich-text-viewer.tsx:1-40`

### 영향 / 시나리오

로더 래퍼만 복제되어, 로드 실패 처리를 한쪽만 고치면 소개/보고서 본문 행동이 갈라진다.

### 근거

sanitizer fallback은 `@dongle/rich-text`에 있고 성공 기준도 그쪽이다.

### 최소 수정안

래퍼를 `@dongle/rich-text`로 올린다.

### 테스트·검증 제안

`rich-text-viewer.test.ts`와 양쪽 소개/보고서 상세 렌더 경로.

---

## P3. 공용 타입 barrel이 도메인 일부를 숨김

### 위치

- `packages/types/src/index.ts` — feedback 미export, `:15` `user.responss`
- 실제 사용: `@dongle/types/feedback/feedback`

### 영향 / 시나리오

AI/사람이 `index.ts`만 보면 피드백 타입이 없는 것처럼 보인다. 오타 파일명은 검색 locality를 떨어뜨린다. 런타임 회귀는 아니다.

### 최소 수정안

feedback을 barrel에 넣고 파일명을 `user.response.ts`로 맞춘다.

### 테스트·검증 제안

`pnpm type`.

---

## 잔여 리스크

- `issueClubRegisterUrlService` (`packages/service/src/club/club.service.ts:58-61`)가 공유 서비스 안에서 ADMIN Next `/api/clubs/registration-urls`를 `BrowserInstance`로 친다. 백엔드 FetchInstance와 목적지가 다른 Adapter가 한 모듈에 있다. 현재 호출은 `use-url-generator.ts`뿐이라 P3 이하로 봤다.
- `known-gaps.md`의 “admin auth 입력 검증/redirect”는 인벤토리상 이미 `test`로 옮겨져 있다. 에이전트가 공백으로 오인할 수 있다.
- 패키지 역의존, 앱 간 import, 일정 표시 helper 공유(`@dongle/ui/schedules/schedule-display`)는 문제로 보이지 않았다.

코드·다른 문서는 이 리뷰에서 수정하지 않았다.

# 제품·도메인 로직 감사 (2026-08-28)

## 범위

- 대상: DONGLE-FRONT Admin/Client 핵심 흐름
- 초점: validation, schema, payload transform, 날짜·timezone, 상태 전이, 실패/빈 상태, `docs/evals/success-criteria.md`와 구현·테스트 불일치
- 시작 문서: `AGENTS.md`, `docs/evals/README.md`, `success-criteria.md`, `test-inventory.md`, `known-gaps.md`, `roadmap.md`
- 방식: 읽기 전용 대조. 근거 없는 추측과 스타일 취향은 제외했다. 이 감사에서 소스·기존 문서는 수정하지 않았다.
- 후속 확인: `TZ=UTC`에서 `"2026-05-01 00:00:00"` → `2026-05-01T00:00:00.000Z`(서울 09:00), `"2026-05-20 10:00:00"` → 서울 19:00. 로컬 KST에서는 같은 문자열이 서울 wall-clock으로 맞는다. P1-1·P1-2의 UTC 재현을 실측으로 뒷받침한다.

## 요약

| 등급 | 건수 | 핵심 |
| --- | --- | --- |
| P0 | 0 | 없음 |
| P1 | 3 | 배너 노출 기간 naive datetime, 일정/배너 폼 기본값 timezone 누락, 동아리 등록 회장 계정 롤백 부재 |
| P2 | 5 | 모집 같은 날짜 helper 불일치, 보고서 공백 검증, 비밀번호 trim 불일치, 캘린더 칸 일자, admin 요일 배지 |
| P3 | 1 | `known-gaps.md`와 인벤토리 불일치 |

---

## P0

없음.

---

## P1

### P1-1. 사용자 배너 노출 기간이 timezone 없는 서버 datetime을 브라우저/서버 로컬로 해석한다

- **위치:** `packages/service/src/main-banner/get-display-banner-image-urls.ts:11-14`, 호출 `apps/DONGLE-CLIENT/src/app/home-page-data.ts:28-30`
- **위반 계약:**
  - Success Criteria / Main Banner Display: 사용자 노출용 배너는 사용 중이고 이미지 URL이 있으며 노출 기간 내인 항목만 포함한다
  - Success Criteria / date picker 값 변환: timezone 없는 서버 datetime 문자열은 브라우저 로컬 timezone이 아니라 Seoul 로컬 날짜시간으로 해석해야 한다
- **영향/시나리오:**
  1. 관리자가 배너 게시 기간을 `2026-08-28 00:00:00` ~ `2026-08-28 09:00:00`으로 저장한다. payload는 timezone 없는 `YYYY-MM-DD HH:mm:ss`다 (`normalizeDateTimeToApiFormat`, `buildMainBannerPayload`).
  2. CLIENT 홈은 RSC에서 `getDisplayMainBannerItems(result)`를 호출한다. `isInPublishPeriod`는 `new Date(banner.publish_start_at)` 비교다.
  3. 배포 런타임 TZ가 UTC이면 `"2026-08-28 00:00:00"`은 UTC 자정(=서울 09:00)으로 파싱된다. 서울 00:30에는 배너가 안 보이고, 서울 09:00~18:00에 보인다. 노출 창이 9시간 밀린다.
  4. 기존 테스트는 banner datetime과 `now`를 같은 `new Date` 로컬 파싱으로 비교해서 TZ가 달라도 통과하며, Seoul 해석을 검증하지 않는다 (`packages/service/src/main-banner/get-display-banner-image-urls.test.ts:10-11,27,41`).
- **최소 수정안:** `getDateTimeTimestamp(publish_*, { timeZone: "Asia/Seoul" })`로 시작/종료를 절대시각 비교한다. `now`는 이미 `Date`이므로 그대로 둔다.
- **테스트·검증 제안:** timezone-less `"2026-05-01 00:00:00"` 배너를 `now = 2026-04-30T15:30:00.000Z`(서울 05-01 00:30)에서 포함, `now = 2026-04-30T14:59:59.000Z`(서울 04-30 23:59)에서 제외. 프로세스 TZ와 무관해야 한다.

### P1-2. 일정·배너 수정 폼 기본값이 timezone-less datetime에서 Seoul wall-clock 분기를 건너뛴다

- **위치:**
  - `packages/utils/src/date.ts:246-256` (`formatDateTimeForInput`는 `options.timeZone`이 있어야 timezone-less 문자열을 wall-clock으로 유지)
  - `apps/DONGLE-ADMIN/src/feature/schedule/form/schedule-form.schema.ts:171-172`
  - `apps/DONGLE-ADMIN/src/feature/main-banner/form/main-banner-form.schema.ts:103-104`
- **위반 계약:**
  - API 응답 ISO 날짜시간은 지정 timezone 기준의 datetime-local 입력값으로 변환되어야 한다
  - timezone 없는 서버 datetime 문자열은 지정 timezone 로컬 시각의 절대 timestamp로 변환할 수 있어야 한다
  - 일정 저장 payload는 `YYYY-MM-DD HH:mm:ss`(timezone 없음)이다 (`schedule-form.schema.ts:184`, `packages/service/src/club/club.schedule.service.test.ts:126,144`)
- **영향/시나리오:**
  1. API가 `start_at: "2026-05-20 19:00:00"`(서울 wall-clock)을 내려준다.
  2. `createClubScheduleDefaultValues` / `createMainBannerDefaultValues`가 `formatDateTimeForInput(value)`를 timezone 없이 호출한다.
  3. timezone-less 분기가 skip되고 `new Date("2026-05-20 19:00:00")` 후 Seoul 포맷이 된다.
  4. 브라우저/런타임 TZ가 UTC이면 입력값이 `2026-05-21T04:00`이 된다. 수정 없이 저장하면 payload가 `2026-05-21 04:00:00`으로 9시간 이동한다.
  5. 기존 테스트는 ISO `Z`만 검증한다 (`schedule-form.schema.test.ts:158-169`, `main-banner-form.schema.test.ts:87-102`). timezone-less 왕복은 공백이다.
- **최소 수정안:** 두 default-values 호출에 `{ timeZone: "Asia/Seoul" }`를 넘긴다. 표시 경로 `apps/DONGLE-ADMIN/src/feature/schedule/schedule.utils.ts:336`은 이미 넘긴다.
- **테스트·검증 제안:** `createClubScheduleDefaultValues({ startsAt: "2026-05-20 19:00:00", endsAt: "2026-05-20 21:00:00" })` → `startsAt: "2026-05-20T19:00"` (프로세스 TZ UTC에서도). 배너 `publish_start_at: "2026-05-20 10:00:00"` → `"2026-05-20T10:00"`.

### P1-3. 동아리 등록이 회장 사용자 생성 이후 동아리 생성 실패를 롤백하지 않는다

- **위치:** `apps/DONGLE-ADMIN/src/feature/club/form/club-register.action.ts:80-117`
- **위반 계약:** 실패 상태 전이의 원자성. 등록 action은 사용자 생성 실패면 중단하지만, 동아리 생성 실패면 이미 생성된 `president` 사용자를 제거하지 않고 `actionFailure`만 반환한다.
- **영향/시나리오:**
  1. `createUserService`가 성공해 `dongle{6digit}` 회장 계정이 생긴다 (`tempId === tempPassword`).
  2. `createClubService`가 실패한다 (키 중복, 검증 오류, 5xx).
  3. action은 실패를 반환하고 temp 자격증명은 클라이언트에 내려주지 않는다.
  4. DB에는 동아리 없는 회장 계정이 남는다. 재시도는 새 `tempId`를 만들어 고아 계정이 누적된다. 해당 계정으로 로그인하면 `clubId` 없어 `no_club`이 된다 (`apps/DONGLE-ADMIN/src/feature/auth/utils/resolve-post-login-path.ts:19-20`).
- **최소 수정안:** 동아리 생성 실패 시 방금 만든 `user.result.id`를 삭제하거나 백엔드 트랜잭션/보상 엔드포인트를 쓴다. 삭제까지 실패하면 그 사실을 formError에 포함한다.
- **테스트·검증 제안:** `createUserService` 성공 + `createClubService` `isSuccess: false`일 때 사용자 삭제(보상)가 호출되고, 삭제 전에는 성공 응답이 아니며 tag revalidate가 없다.

---

## P2

### P2-1. `validateClubForm`은 모집 시작일=마감일을 허용하고, 실제 스키마·성공 기준은 거부한다

- **위치:** `apps/DONGLE-ADMIN/src/feature/club/validation/club-form.validation.ts:120-126` (`startDate > endDate`)
- **대조:** `club-edit.schema.ts:73-83`, `club-register.schema.ts:52-62` (`startDate >= endDate`), Success Criteria 「같은 날짜는 허용하지 않는다」
- **영향/시나리오:** `validateClubForm({ recruitmentStartDate: "2026-05-20", recruitmentEndDate: "2026-05-20", ...모집중 })` → `isValid: true`. `clubEditSchema.safeParse` 동일 입력 → 실패 (`club-edit.schema.test.ts:54-64`). 현재 폼 제출 경로는 스키마라 사용자 회귀는 없지만, 성공 기준이 가리키는 helper·테스트(`club-form.validation.test.ts`)는 같은 날짜를 검증하지 않는다.
- **최소 수정안:** helper 비교를 `>=`로 맞춘다. 호출부가 없다면 helper를 스키마와 공유하거나 테스트에서 같은 날짜 실패를 고정한다.
- **테스트·검증 제안:** 모집중 + 같은 날짜 → `recruitmentEndDate` 에러.

### P2-2. 활동보고서 제목/내용이 trim되지 않아 공백만으로 통과할 수 있다

- **위치:** `apps/DONGLE-ADMIN/src/feature/report/validation/activity-report.validation.ts:18-33`, 스키마 `activity-report.schema.ts:9-14` (`z.string()` transform 없음)
- **위반 계약:** 「제목과 내용은 빈 값일 수 없다」. 동아리/사용자 폼은 `trimToEmpty` 후 빈 값을 거부한다.
- **영향/시나리오:** `title: "  "`(길이 2), `content: "          "`(길이 10). `!title`/`!content`는 통과하고 최소 길이를 만족한다. 테스트는 `""`와 짧은 문자열만 본다.
- **최소 수정안:** 검증 전 `trimToEmpty`(또는 스키마 transform). 공백-only는 빈 값 메시지.
- **테스트·검증 제안:** 공백 제목/내용 거부. 앞뒤 공백이 있는 유효 문장은 trim 후 길이 기준으로 통과/실패.

### P2-3. 사용자 생성 비밀번호는 trim하지 않고, 수정 payload는 trim한다

- **위치:** `apps/DONGLE-ADMIN/src/feature/user/form/user-form.schema.ts:14` (`password: z.string()`), `user-form.action.ts:38` (원문 전송), `user-form.schema.ts:82-85` (수정은 `trimToEmpty` 후 포함)
- **위반 계약:** 수정은 「입력된 경우에만 trim 후 payload에 포함」. 생성은 trim을 말하지 않지만 같은 계정 입력 검증을 공유한다. 테스트가 생성 시 `" password "` 보존을 고정한다 (`user-form.schema.test.ts:19-33`).
- **영향/시나리오:** 생성에 비밀번호 `" password "` → 저장된 값이 공백 포함. 로그인 policy는 password 원문 보존 (`login-form-policy`). 이후 수정에서 같은 값을 넣으면 trim되어 다른 비밀번호가 된다.
- **최소 수정안:** 생성 스키마/action도 비밀번호를 trim하거나, 성공 기준에 생성은 원문 보존이라고 명시하고 수정과 의도를 분리한다.
- **테스트·검증 제안:** 선택한 정책에 맞춰 생성·수정·로그인 세 경로가 같은 비밀번호 문자열을 쓰는지.

### P2-4. 관리자 월간 캘린더 칸 숫자는 로컬 `getDate()`, 일정 매칭 키는 Seoul이다

- **위치:** `apps/DONGLE-ADMIN/src/feature/schedule/components/admin-schedule-dashboard.tsx:421` (`date.getDate()`), `schedule.utils.ts:63-64,76-81` (`formatDateForRequest(..., { timeZone: "Asia/Seoul" })`)
- **위반 계약:** 선택한 날짜의 일정은 Seoul 기준 시작일과 종료일 사이에 선택 날짜가 포함되는지로 계산되어야 한다. 월간 캘린더는 안정적으로 계산해야 한다.
- **영향/시나리오:** TZ `Pacific/Auckland`(UTC+12)에서 2026-06 캘린더. 로컬 6월 1일 00:00의 Seoul 키는 5월 31일이다. 칸에는 `1`이 찍히지만 그 칸 일정은 서울 5월 31일 일정이다. KST 관리자에서는 로컬=서울이라 안 드러난다.
- **최소 수정안:** 칸 라벨과 selected date도 `getScheduleCalendarDateKey`의 Seoul 일자를 쓴다.
- **테스트·검증 제안:** 비자정 TZ에서 칸 라벨 일자 === Seoul date key의 `DD`.

### P2-5. Admin 일정 요일 배지가 timezone-less 값을 `new Date`로 파싱한다

- **위치:** `apps/DONGLE-ADMIN/src/feature/schedule/schedule.utils.ts:327-328,365-368`
- **위반 계약:** timezone-less datetime은 Seoul로 해석. shared helper `packages/ui/src/schedules/schedule-display.ts:71-103,153-156`는 wall-clock 파츠 + UTC weekday로 올바르다.
- **영향/시나리오:** `2026-08-28 23:00:00`(금, 서울). TZ `America/Los_Angeles`에서 `new Date` 후 `timeZone: Asia/Seoul` weekday → 토요일이 될 수 있다. 클라이언트 상세는 shared helper를 써서 금요일이다.
- **최소 수정안:** admin 표시를 `getScheduleDisplayDateParts`로 통일하거나, weekday 계산 전에 Seoul 파츠를 쓴다.
- **테스트·검증 제안:** timezone-less 금요일 23:00의 weekday가 프로세스 TZ와 무관하게 `금`.

---

## P3

### P3-1. `known-gaps.md`가 이미 테스트로 옮긴 항목을 높은 공백으로 남겨 둔다

- **위치:** `docs/evals/known-gaps.md:18-21`
- **위반 계약:** Eval README 「테스트로 못 옮긴 이유가 있는데 known-gaps.md에 남기지 않으면 보류 판단이 없는 것으로 본다」의 역. 공백 문서가 실제 인벤토리와 어긋난다.
- **영향/시나리오:** 「admin auth / club auth의 입력 검증과 redirect 판단」, 「client 메인 empty-state」가 우선 공백으로 남아 있으나 `test-inventory.md`와 `resolve-post-login-path.test.ts`, `login-form-policy.test.ts`, `club-search-empty-state.test.ts`, `club-list-section.test.tsx`가 이미 커버한다.
- **최소 수정안:** 해당 줄을 완료/삭제하고, 남은 실제 공백(위 P1 timezone-less 왕복, 등록 보상 트랜잭션 등)만 남긴다.
- **테스트·검증 제안:** 없음 (문서 계약). `pnpm verify:docs`가 내용 적절성까지는 강제하지 않는다 (`roadmap.md` 보류).

---

## 확인했으나 이 감사에서 문제로 보지 않은 것

- 일정 생성/수정 action의 `isSuccess` 미검사: service가 `getResponseResult`로 throw하므로 실패는 catch로 실패 응답이 된다 (`packages/service/src/club/club.schedule.service.ts:86-91`, `schedule.action.test.ts` 실패 분기).
- 사용자/보고서/동아리 목록·클라이언트 검색·일정 탭의 loadFailed vs empty 분기는 구현·테스트가 성공 기준과 맞다.
- 활동보고서 상세 404 vs 서버 실패: `apps/DONGLE-CLIENT/src/app/clubs/[clubId]/reports/[reportId]/page.tsx:98-107`이 status 404만 `notFound()`, 그 외 throw. service는 404를 그대로 통과 (`club.report.service.test.ts:64-106`).
- 모집 마감 같은 날짜: live 경로는 schema `>=`로 거부.
- 회장 로그인 `returnTo` vs `clubId`: `resolve-post-login-path.ts:19-20`이 clubId를 먼저 본다.
- 캐시 태그/webhook prefix, 일정 삭제 전 상세 조회 실패 시 삭제 중단: action 테스트와 구현이 일치한다.

---

## 잔여 리스크

- `getRecruitDday`는 `new Date(recruitEnd)` 후 Seoul 달력 일수를 쓴다. fixture/수정 payload는 date-only 또는 ISO `Z`라 UTC 서버에서도 달력이 맞을 가능성이 크다. API가 배너/일정처럼 timezone-less `YYYY-MM-DD HH:mm:ss`를 주면 RSC에서 D-day가 하루 어긋날 수 있다. API 실응답 형식을 확인하기 전에는 P1로 올리지 않았다.
- 본 감사는 읽기 전용이라 `pnpm verify:fast`는 실행하지 않았다.
- KST 관리자/사용자만 쓰면 P1-2·P2-4·P2-5는 숨고, P1-1은 Vercel 등 UTC 서버 RSC에서 바로 드러난다.

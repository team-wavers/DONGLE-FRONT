# Success Criteria

이 문서는 현재 기본 테스트가 지켜야 하는 성공 기준을 정리한다.

## 기록 원칙

- 여기에는 “무엇이 맞는 동작인가”만 적는다.
- 실행 명령, 우선순위, 보류 사유, 환경 제약은 다른 문서에 적는다.
- 테스트 파일 링크는 현재 기준을 보여주기 위한 참조이며, source of truth는 성공 조건 자체다.

## Admin Club Management

### 검색 필터

- 검색어는 trim 후 소문자 기준으로 비교된다.
- 동아리 이름과 분과(category) 모두 검색 대상이다.
- 검색 결과는 일관된 deterministic 로직으로 계산된다.

관련 테스트:
- [filterable-club-list.test.ts](../../apps/DONGLE-ADMIN/src/feature/club/components/filterable-club-list/filterable-club-list.test.ts)

## Client Analytics

### PostHog 이벤트 계약

- 공개 클라이언트 분석 이벤트는 허용된 이벤트 이름과 속성만 전송해야 한다.
- 브라우저가 아닌 환경에서는 분석 이벤트 전송이 no-op이어야 한다.
- 이벤트 속성에는 검색어 원문, 전화번호, 사용자 계정 정보 같은 민감 필드를 포함하지 않아야 한다.

관련 테스트:
- [analytics.test.ts](../../apps/DONGLE-CLIENT/src/lib/analytics.test.ts)

## Club Form

### 등록 폼 스키마

- 동아리 등록 폼은 클라이언트와 서버 액션이 같은 스키마를 기준으로 검증해야 한다.
- 쉼표로 입력한 태그 문자열은 공백과 빈 항목을 제거한 배열로 변환되어야 한다.
- 동아리 등록 폼에서 선택한 아이콘 파일은 동아리 생성 이후 업로드되고 `icon_url`로 저장되어야 한다.

### 수정 폼 스키마

- 동아리 수정 폼은 클라이언트와 서버 액션이 같은 스키마를 기준으로 검증해야 한다.
- 수정 폼의 텍스트 입력값은 제출 전에 trim 정규화되어야 한다.
- 쉼표로 입력한 태그 문자열은 공백과 빈 항목을 제거한 배열로 변환되어야 한다.

### 수정 payload 조합

- 모집마감 상태로 수정하면 모집 시작일과 마감일은 `null`로 제거해야 한다.
- 모집중 상태로 수정하면 검증된 모집 시작일과 마감일을 payload에 유지해야 한다.
- 아이콘 삭제 또는 업로드 결과가 있으면 `icon_url`을 명시적으로 payload에 포함해야 한다.
- 새 아이콘 업로드 성공 후에는 업로드된 URL을 성공 결과로 반환해 다음 수정 기준값의 `iconUrls`가 최신 URL을 유지해야 한다.

### 회장 수정 폼 스키마

- 회장 수정 폼은 클라이언트와 서버 액션이 같은 스키마를 기준으로 검증해야 한다.
- 회장 이름과 연락처는 제출 전에 trim 정규화되어야 한다.

### 모집 상태 정규화

- 화면 라벨과 내부 enum 값이 같은 의미로 정규화되어야 한다.

### 전화번호 검증

- 휴대폰 번호 형식만 허용한다.
- 공백과 하이픈이 섞여도 허용한다.

### 모집 기간 검증

- 모집중이면 모집 시작일과 모집 마감일이 필수다.
- 모집 마감일은 모집 시작일보다 빠를 수 없다.

### 회장 정보 검증 옵션

- 일부 호출에서는 회장 정보 검증을 끌 수 있어야 한다.

### 소개/주요 활동 rich text 검증

- 동아리 설명과 주요 활동은 rich text 마크업만 있는 빈 값으로 저장될 수 없다.

관련 테스트:
- [club-register.schema.test.ts](../../apps/DONGLE-ADMIN/src/feature/club/form/club-register.schema.test.ts)
- [club-register.action.test.ts](../../apps/DONGLE-ADMIN/src/feature/club/form/club-register.action.test.ts)
- [club-edit.schema.test.ts](../../apps/DONGLE-ADMIN/src/feature/club/form/club-edit.schema.test.ts)
- [club-edit-payload.test.ts](../../apps/DONGLE-ADMIN/src/feature/club/form/club-edit-payload.test.ts)
- [club-edit.action.test.ts](../../apps/DONGLE-ADMIN/src/feature/club/form/club-edit.action.test.ts)
- [club-president.schema.test.ts](../../apps/DONGLE-ADMIN/src/feature/club/form/club-president.schema.test.ts)
- [club-form.validation.test.ts](../../apps/DONGLE-ADMIN/src/feature/club/validation/club-form.validation.test.ts)

## Admin Shared Action

### action result

- typed server action은 성공/실패를 `ok` 기준의 공통 결과 형태로 표현할 수 있어야 한다.
- 실패 결과는 field error와 form error를 함께 담을 수 있어야 한다.
- 실패 결과는 필요한 경우 retry 가능 여부와 에러 종류 메타를 함께 담을 수 있어야 한다.

### zod field error 변환

- zod issue 목록은 field별 첫 번째 에러 메시지만 공통 field error map으로 변환해야 한다.
- field path가 없는 issue는 field error map에 포함하지 않아야 한다.

관련 테스트:
- [action-result.test.ts](../../apps/DONGLE-ADMIN/src/shared/action/action-result.test.ts)
- [zod-field-errors.test.ts](../../apps/DONGLE-ADMIN/src/shared/action/zod-field-errors.test.ts)

## Admin Shared Form

### date picker 값 변환

- 날짜 picker에서 선택한 로컬 날짜는 UTC 변환으로 하루 앞당겨지지 않아야 한다.
- 시간 포함 날짜 picker 값은 UTC 변환 없이 `YYYY-MM-DD HH:mm:ss` 형식으로 유지되어야 한다.
- 선택한 날짜가 없으면 빈 문자열로 정규화해야 한다.
- API 응답 ISO 날짜시간은 지정 timezone 기준의 `datetime-local` 입력값으로 변환되어야 한다.
- `datetime-local` 입력값은 timezone 변환 없이 API 요청 날짜시간 문자열로 변환되어야 한다.
- API 응답 ISO 날짜 표시는 기본적으로 Seoul 기준 날짜를 사용해야 한다.
- timezone 없는 서버 datetime 문자열은 브라우저 로컬 timezone이 아니라 Seoul 로컬 날짜시간으로 해석해야 한다.
- timezone 없는 서버 datetime 문자열은 지정 timezone 로컬 시각의 절대 timestamp로 변환할 수 있어야 한다.
- 월 상태 key는 지정 timezone 기준 월을 `YYYY-MM`으로 표현하고, timezone 없는 월 첫날 `Date`로 복원할 수 있어야 한다.

관련 테스트:
- [date-picker-value.test.ts](../../apps/DONGLE-ADMIN/src/shared/form/date-picker-value.test.ts)
- [date.test.ts](../../packages/utils/src/date.test.ts)

## User Form

### 계정 입력 검증

- 사용자 생성/수정 폼은 클라이언트와 서버 액션이 같은 스키마를 기준으로 검증해야 한다.
- 공백 loginId는 거부한다.
- 비밀번호는 required 여부에 따라 빈 값 허용 규칙이 달라진다.
- 전화번호는 올바른 휴대폰 형식만 통과한다.
- 사용자 생성 폼은 역할을 입력받지 않고 관리자 계정으로 생성한다.
- 사용자 수정 폼은 역할을 변경하지 않는다.

### 수정 payload 조합

- 사용자 수정 payload는 변경된 필드만 포함한다.
- 수정 폼의 비밀번호는 입력된 경우에만 payload에 포함한다.

관련 테스트:
- [user-form.schema.test.ts](../../apps/DONGLE-ADMIN/src/feature/user/form/user-form.schema.test.ts)
- [user-form.validation.test.ts](../../apps/DONGLE-ADMIN/src/feature/user/validation/user-form.validation.test.ts)
- [user-form.action.test.ts](../../apps/DONGLE-ADMIN/src/feature/user/form/user-form.action.test.ts)

## Admin User Management

### 검색 필터

- 검색어는 trim 후 소문자 기준으로 비교된다.
- 이름, 로그인 ID, 전화번호, 역할, 소속 동아리명이 검색 대상이다.
- 검색 결과는 일관된 deterministic 로직으로 계산된다.

관련 테스트:
- [filterable-user-list.test.ts](../../apps/DONGLE-ADMIN/src/feature/user/components/filterable-user-list.test.ts)

## Next Cache Policy

### 캐시 태그 중앙화

- 동아리, 사용자, 활동보고서, 메인 배너, 일정 캐시 태그는 중앙 상수와 tag group helper로 생성되어야 한다.
- 목록/상세/club scope/item scope 태그 조합은 도메인별 helper를 기준으로 일관되게 계산되어야 한다.

### fetch cache 정책

- 사용자 공개 조회는 `force-cache`, 도메인 태그, 공통 `revalidate` 값을 함께 사용해야 한다.
- 관리자/회장/사용자 관리 조회는 `no-store`만 사용하고 `next.tags`를 붙이지 않아야 한다.
- 생성/수정/삭제 service는 fetch cache option을 붙이지 않고, 성공한 server action이 관련 tag group을 초기화해야 한다.

관련 테스트:
- [cache-tags.test.ts](../../packages/service/src/cache-tags.test.ts)
- [club.service.test.ts](../../packages/service/src/club/club.service.test.ts)
- [user.service.test.ts](../../packages/service/src/user/user.service.test.ts)
- [club.report.service.test.ts](../../packages/service/src/club/club.report.service.test.ts)
- [main-banner.service.test.ts](../../packages/service/src/main-banner/main-banner.service.test.ts)

## Admin Schedule Management

### 캘린더 날짜 계산

- 월간 캘린더는 표시 월의 앞뒤 날짜를 포함해 6주 날짜를 안정적으로 계산해야 한다.
- 선택한 날짜의 일정은 Seoul 기준 시작일과 종료일 사이에 선택 날짜가 포함되는지로 계산되어야 한다.
- 여러 날에 걸친 일정은 시작일부터 종료일까지 해당하는 모든 캘린더 날짜 칸에 표시되어야 한다.
- 관리자 일정 화면의 초기 표시 월은 UTC ISO 문자열이 아니라 timezone 없는 `YYYY-MM` key로 전달되어야 한다.
- 관리자 월간 일정 조회 query는 표시 월 key에서 Seoul 기준 서버 요청 문자열(`YYYY-MM-DD HH:mm:ss`)로 생성되어야 한다.

### 일정 필터와 정렬

- 검색어는 trim 후 소문자 기준으로 비교된다.
- 일정 제목, 동아리명, 분과, 장소가 검색 대상이다.
- 분과, 일정 유형, 공개 상태 필터가 함께 적용되어야 한다.
- 일정 상태 필터는 시작 전, 진행 중, 종료 후 일정을 구분해야 한다.
- 일정 상태와 정렬 계산은 timezone 없는 서버 datetime 문자열을 Seoul 로컬 시각으로 해석해야 한다.
- 회장 일정 필터는 공개 상태와 Date 필터를 함께 적용해야 한다.
- Date 필터는 전체 기간, 오늘, 이번 주, 이번 달, 직접 선택 범위를 지원해야 한다.
- Date 필터는 일정의 시작일시와 종료일시 기간이 선택 범위와 겹치면 포함해야 한다.
- 회장 일정 목록은 진행 중 일정을 월별 목록과 분리된 별도 상단 섹션으로 표시해야 한다.
- 회장 일정 목록의 진행 중 일정은 종료일시가 가까운 순으로 정렬되어야 한다.
- 회장 일정 목록의 나머지 일정은 현재 시점과 가까운 순으로 정렬한 뒤 Seoul 기준 시작 월별로 묶어야 한다.

### 일정 응답 변환

- 관리자 일정 응답의 `club` 정보는 화면 일정의 `clubId`, `clubName`, `category`로 변환되어야 한다.
- 관리자 일정 응답은 `club_id`와 `club.id`, `club.name`, `club.category`를 포함해야 한다.
- 회장 일정 응답은 별도 동아리 상세 조회 없이 응답의 `club_id`를 화면 일정의 `clubId`로 변환해야 한다.
- 백엔드 일정 응답의 `start_at`, `end_at`, `is_public`, `external_url`은 화면 모델의 날짜/공개/외부 링크 필드로 변환되어야 한다.
- nullable 문자열 필드는 화면에서 안전하게 렌더링되도록 빈 문자열 또는 `undefined`로 정규화되어야 한다.

### 일정 표시 포맷

- 같은 날 시작/종료 일정은 시작 날짜시간과 종료 시간만 표시해야 한다.
- 서로 다른 날 시작/종료 일정은 시작 날짜시간과 종료 날짜시간을 모두 표시해야 한다.
- 잘못된 일정 날짜시간은 fallback 문구로 표시해야 한다.
- 빈 장소는 화면에서 `장소 미정`으로 표시해야 한다.
- 빈 설명은 화면에서 `설명이 없습니다.`로 표시해야 한다.
- 목록 메타 문자열은 빈 값을 제외하고 구분자를 조합해야 한다.
- 일정 목록용 날짜 배지는 시작일시의 Seoul 기준 월, 일, 요일을 표시해야 한다.
- 일정 목록용 기간은 사용자 화면처럼 시작 날짜시간과 종료 날짜시간을 한 문자열로 표시해야 한다.
- 일정 목록 그룹은 각 화면의 정렬 순서를 유지하며 Seoul 기준 시작 월별로 묶여야 한다.
- 일정 표시용 날짜 배지, 기간 문자열, 월별 그룹 key는 admin/client가 같은 shared helper 기준을 사용해야 한다.
- 사용자 동아리 상세 일정은 진행 중 일정을 월별 목록과 분리된 별도 상단 섹션으로 표시하고, 나머지 일정은 Seoul 기준 시작 월별 섹션으로 묶어야 한다.
- 관리자 일정 목록 항목은 날짜 아젠다 없이 동아리명과 분과를 우선 표시해야 한다.
- 회장 일정 외부 링크는 입력값이 있으면 http 또는 https 외부 URL로 검증해야 한다.

### 회장 일정 폼

- 일정 폼은 클라이언트와 서버 액션이 같은 스키마를 기준으로 검증해야 한다.
- 일정 유형은 모집, 행사, 정기모임만 허용해야 한다.
- 일정 제목, 시작일시, 종료일시는 필수다.
- 종료일시는 시작일시보다 늦어야 한다.
- 외부 링크는 입력값이 있으면 http 또는 https 외부 URL로 검증해야 한다.
- 일정 저장 payload는 화면 폼 값을 trim 정규화하고 API 필드명으로 변환해야 한다.

### 일정 action result

- 일정 생성, 수정, 삭제, 관리자 공개 상태 변경, 관리자 월간 조회 action은 공통 `ActionResult` 형태로 성공/실패를 표현해야 한다.
- 일정 생성/수정 action은 스키마 검증 실패 시 field error와 form error를 반환해야 한다.
- 일정 삭제 service가 실패 응답을 반환하면 action은 실패를 반환하고 schedule tag group을 초기화하지 않아야 한다.

관련 테스트:
- [schedule.utils.test.ts](../../apps/DONGLE-ADMIN/src/feature/schedule/schedule.utils.test.ts)
- [schedule-display.test.ts](../../packages/ui/src/schedules/schedule-display.test.ts)
- [schedule-form.schema.test.ts](../../apps/DONGLE-ADMIN/src/feature/schedule/form/schedule-form.schema.test.ts)
- [schedule.action.test.ts](../../apps/DONGLE-ADMIN/src/feature/schedule/action/schedule.action.test.ts)

## Club Schedule Service

### 사용자/회장 일정 엔드포인트

- 사용자 공개 일정 목록은 `/clubs/:clubId/public-schedules`를 호출해야 한다.
- 회장 일정 목록은 `/clubs/:clubId/schedules`를 호출하고 status filter가 있으면 query string에 반영해야 한다.
- 회장 일정 생성/수정/삭제는 `/clubs/:clubId/schedules` 하위 엔드포인트를 호출하고 성공한 action이 schedule tag group을 초기화해야 한다.
- 회장 일정 삭제 service가 실패 응답을 반환하면 action은 실패를 반환하고 schedule tag group을 초기화하지 않아야 한다.

### 관리자 일정 엔드포인트

- 관리자 전체 일정 목록은 `/club-schedules`를 호출하고 필터 query string을 보존해야 한다.
- 관리자 캘린더 목록은 `/club-schedules/calendar`를 호출해야 한다.
- 관리자 단건 조회, 공개 상태 변경, 삭제는 `/club-schedules/:scheduleId` 하위 엔드포인트를 사용해야 한다.
- 관리자 일정 삭제 service가 실패 응답을 반환하면 action은 실패를 반환하고 schedule tag group을 초기화하지 않아야 한다.

관련 테스트:
- [club.schedule.service.test.ts](../../packages/service/src/club/club.schedule.service.test.ts)
- [schedule.action.test.ts](../../apps/DONGLE-ADMIN/src/feature/schedule/action/schedule.action.test.ts)

## Report Create / Update

### 보고서 입력 검증

- 활동보고서 작성/수정 폼은 클라이언트와 서버 액션이 같은 스키마를 기준으로 검증해야 한다.
- 제목과 내용은 빈 값일 수 없다.
- 제목 최소 길이와 내용 최소 길이를 만족해야 한다.

### 수정 payload 조합

- 변경된 필드만 payload에 포함한다.
- 이미지 순서만 바뀐 경우는 변경으로 보지 않는다.
- 삭제되지 않은 기존 이미지와 새 업로드 이미지를 올바르게 합친다.
- JSON 배열 문자열 입력은 안전하게 파싱한다.

### action 에러 분기 규약

- 인증 만료는 `sessionExpired: true`와 form error를 함께 반환한다.
- 이미지 업로드 실패는 retry 가능한 form error와 retry hint를 반환한다.
- 서비스 실패(4xx/5xx 포함)는 action 종류(생성/수정)에 맞는 form error를 반환한다.
- 예외 throw는 공통 exception form error 규약으로 매핑한다.

관련 테스트:
- [activity-report.schema.test.ts](../../apps/DONGLE-ADMIN/src/feature/report/form/activity-report.schema.test.ts)
- [activity-report.validation.test.ts](../../apps/DONGLE-ADMIN/src/feature/report/validation/activity-report.validation.test.ts)
- [report-update-payload.test.ts](../../apps/DONGLE-ADMIN/src/feature/report/validation/report-update-payload.test.ts)
- [report-action-error-policy.test.ts](../../apps/DONGLE-ADMIN/src/feature/report/action/report-action-error-policy.test.ts)
- [activity-report-create.action.test.ts](../../apps/DONGLE-ADMIN/src/feature/report/form/activity-report-create.action.test.ts)
- [activity-report-update.action.test.ts](../../apps/DONGLE-ADMIN/src/feature/report/form/activity-report-update.action.test.ts)

## Admin URL Generation

### 등록 URL 변환

- `?key=` query가 있으면 현재 origin 기준 `/club-register/:key` 경로로 변환한다.
- key가 없으면 원본 URL을 유지한다.

관련 테스트:
- [use-url-generator.test.ts](../../apps/DONGLE-ADMIN/src/hooks/use-url-generator.test.ts)

## Admin Auth

### 로그인 후 내부 복귀 경로 검증

- `returnTo`는 trim/URL decode 이후 내부 경로만 허용한다.
- protocol-relative URL(`//...`)과 외부 URL은 허용하지 않는다.
- 인코딩된 protocol-relative 우회 문자열(`%2F%2F...`)도 허용하지 않는다.

### 로그인 입력/오류 분기 정책

- username 입력은 trim 정규화를 적용한다.
- password 입력은 공백 포함 원문을 보존한다.
- 정규화된 username 또는 빈 password는 필드 오류를 반환한다.
- action 예외 분기는 Error message 유지와 기본 에러 fallback 규칙을 따른다.

관련 테스트:
- [normalize-internal-return-to.test.ts](../../apps/DONGLE-ADMIN/src/feature/auth/utils/normalize-internal-return-to.test.ts)
- [login-form-policy.test.ts](../../apps/DONGLE-ADMIN/src/feature/auth/utils/login-form-policy.test.ts)

## Client Club Search

### 검색 로직

- 검색어는 trim/lowercase 기준으로 정규화한다.
- 이름과 분과를 동시에 검색한다.
- 모집 상태 필터와 분과 필터, 검색어 필터가 함께 적용된다.
- 분과 필터 옵션은 현재 목록의 분과 값으로부터 중복 없이 결정된다.

### 요약 문구

- 전체 상태에서는 총 동아리, 모집중, 모집마감 개수를 함께 보여준다.
- 검색어가 있으면 검색 결과 수와 그중 모집중 개수를 보여준다.
- 분과 필터가 있으면 해당 분과 결과 수와 그중 모집중 개수를 보여준다.
- 모집중/모집마감 상태 필터에서는 현재 결과 수와 전체 상태별 개수를 함께 보여준다.

### Empty-state 계산

- 검색 결과가 존재하면 empty-state는 `not-empty`와 `null` message를 반환한다.
- 검색어가 있거나 전체 필터에서 결과가 비면 `no-result`와 기본 안내 문구를 반환한다.
- 모집중/모집마감 필터에서 해당 상태 데이터가 원천적으로 없으면 각각 `no-open-recruitment`, `no-closed-recruitment` 상태코드를 반환한다.

### 쿼리스트링 연동

- 검색어, 모집 상태, 분과 필터는 URL query string으로 파싱/생성될 수 있어야 한다.
- 빈 검색어와 기본 필터값은 query string에서 제거된다.
- 잘못된 모집 상태 값은 전체 상태로 정규화된다.
- 필터 query string 갱신 시 관련 없는 기존 query parameter는 유지된다.
- 필터 초기화는 모집 상태와 분과를 한 번의 query string 갱신으로 제거한다.

관련 테스트:
- [use-club-filters.test.ts](../../apps/DONGLE-CLIENT/src/hooks/use-club-filters.test.ts)
- [club-search-empty-state.test.ts](../../apps/DONGLE-CLIENT/src/lib/club-search-empty-state.test.ts)

## Client Club Schedule

### 동아리 상세 일정

- 사용자 동아리 상세 일정은 해당 동아리의 공개 일정만 포함해야 한다.
- 비공개 일정은 사용자 동아리 상세 일정에 포함하지 않아야 한다.
- 일정은 진행 중인 일정, 다가오는 일정, 지난 일정으로 분리되어야 한다.
- 진행 중인 일정은 시작일시가 현재 시각보다 이전이거나 같고 종료일시가 현재 시각보다 이후이거나 같은 일정이어야 한다.
- 다가오는 일정은 시작일시가 현재 시각보다 이후인 일정이어야 한다.
- 지난 일정은 종료일시가 현재 시각보다 이전인 일정이어야 한다.
- 진행 중 일정은 종료일시가 가까운 순으로 정렬되어야 한다.
- 진행 중이 아닌 나머지 일정은 현재 시점과 가까운 순으로 정렬되어야 한다.
- 백엔드 공개 일정 응답은 응답의 `club_id`를 기준으로 화면 일정 모델의 `clubId`로 변환되어야 한다.
- 사용자 동아리 상세의 공개 일정 기간은 Seoul 기준으로 표시해야 한다.
- 사용자 동아리 상세의 공개 일정 날짜시간은 `M월 D일 H시 mm분` 형식으로 표시해야 한다.
- 사용자 동아리 상세의 공개 일정 시간이 `00시 00분`이면 시간은 생략하고 날짜만 표시해야 한다.
- 같은 날 시작/종료 일정은 시작 날짜시간과 종료 시간만 표시해야 한다.
- 서로 다른 날 시작/종료 일정은 시작 날짜시간과 종료 날짜시간을 모두 표시해야 한다.
- 사용자 동아리 상세 일정의 모바일 목록 기간은 시간을 제외하고 `M월 D일` 또는 `M월 D일 - M월 D일` 형식으로 표시해야 한다.
- 사용자 동아리 상세 일정 목록은 진행 중 일정을 월별 목록과 분리된 별도 상단 섹션으로 표시하고 나머지는 Seoul 기준 시작 월별 섹션으로 묶어 표시해야 한다.
- 사용자 동아리 상세 일정의 월별 그룹은 중복 월 섹션을 만들지 않고 shared schedule display helper 기준으로 병합해야 한다.
- 사용자 동아리 상세 일정 목록은 날짜 아젠다 없이 각 일정 항목 안에 일정 기간을 독립적으로 표시해야 한다.
- 일정 유형 태그는 모집, 행사, 정기모임을 서로 다른 색상으로 구분해야 한다.
- 공개 일정 외부 링크가 있으면 사용자 동아리 상세 일정에 링크 CTA로 표시해야 한다.
- 공개 일정 외부 링크는 화면 모델 변환 시 공통 URL 정규화를 거쳐야 한다.
- 공개 일정 조회가 실패해도 동아리 상세 페이지는 중단되지 않아야 하며, 일정 탭에는 일정 없음과 구분되는 실패 안내가 표시되어야 한다.

### 동아리 상세 활동보고서

- 활동보고서 목록 조회가 실패해도 동아리 상세 페이지는 중단되지 않아야 하며, 활동보고서 탭에는 활동보고서 없음과 구분되는 실패 안내가 표시되어야 한다.

## Client Loading UX

### 사용자 페이지 스켈레톤

- 동아리 상세 로딩 UI는 실제 상세 화면의 헤더, 태그, 정보 카드, 탭 콘텐츠 구조를 반영해야 한다.
- 동아리 상세 소개 탭의 rich text 본문은 sanitizing/rendering 지연 중에도 소개와 주요 활동 본문 영역 높이를 스켈레톤으로 먼저 확보해야 한다.
- 활동보고서 상세 로딩 UI는 뒤로가기, 제목/메타, 동아리 요약, 이미지, 본문, 다른 보고서 목록 구조를 반영해야 한다.
- 동아리 상세와 활동보고서 상세 라우트는 라우트 전환 중 표시할 `loading.tsx`를 제공해야 한다.

관련 테스트:
- [club-schedule.test.ts](../../apps/DONGLE-CLIENT/src/lib/club-schedule.test.ts)
- [club.schedule.service.test.ts](../../packages/service/src/club/club.schedule.service.test.ts)

## Club Report Detail Service

### 단건 조회

- 활동보고서 단건 조회는 `/clubs/:id/reports/:reportId`를 캐시 없이 호출해야 한다.

관련 테스트:
- [club.report.service.test.ts](../../packages/service/src/club/club.report.service.test.ts)

## Shared Utilities

### URL 정규화

- 일반 외부 링크는 `http` 또는 `https` URL만 허용해야 한다.
- 프로토콜 없는 외부 호스트는 `https` URL로 정규화해야 한다.
- protocol-relative 외부 URL은 `https` URL로 정규화해야 한다.
- credential 포함 URL, 상대 경로, unsupported scheme, 빈 값은 `null`로 정규화해야 한다.

관련 테스트:
- [url.test.ts](../../packages/utils/src/url.test.ts)

### Main Banner Display

- 사용자용 배너 목록 조회는 공개 엔드포인트인 `/main-banners`를 사용해야 한다.
- 관리자용 배너 목록 조회는 관리자 엔드포인트인 `/main-banners/admin`을 사용해야 한다.
- 관리자용 배너 단건 조회는 `/main-banners/admin/:id`를 캐시 없이 호출해야 한다.
- 관리자 배너 폼은 클라이언트와 서버 액션이 같은 스키마를 기준으로 검증해야 한다.
- 관리자 배너 폼은 날짜와 시간을 함께 선택할 수 있어야 한다.
- 관리자 배너 폼의 시간 포함 제출값은 API가 받는 `YYYY-MM-DD HH:mm:ss` 형식이어야 한다.
- 관리자 배너 폼은 이미지가 없으면 저장할 수 없다.
- 관리자 배너 폼은 `http(s)` URL 또는 `/`로 시작하는 내부 경로만 링크로 허용한다.
- 사용자 노출용 배너는 사용 중이고 이미지 URL이 있으며 노출 기간 내인 항목만 포함한다.
- 배너 클릭 링크는 `http(s)` URL 또는 `/`로 시작하는 내부 경로만 허용한다.
- 허용되지 않는 링크는 사용자 노출 데이터에서 `null`로 정규화한다.
- 사용자 배너 클릭 링크는 새 탭에서 열려야 한다.

관련 테스트:
- [get-display-banner-image-urls.test.ts](../../packages/service/src/main-banner/get-display-banner-image-urls.test.ts)
- [main-banner.service.test.ts](../../packages/service/src/main-banner/main-banner.service.test.ts)
- [main-banner-datetime.test.ts](../../apps/DONGLE-ADMIN/src/feature/main-banner/utils/main-banner-datetime.test.ts)
- [main-banner-form.schema.test.ts](../../apps/DONGLE-ADMIN/src/feature/main-banner/form/main-banner-form.schema.test.ts)

### API Token Refresh Retry

- 401 응답이면 일반 API 요청은 토큰 갱신 후 1회만 재시도한다.
- `skipAuthRefresh` 요청은 401이어도 토큰 갱신 재시도 대상이 아니다.
- 이미 토큰 갱신 후 재시도한 요청은 다시 토큰 갱신을 반복하지 않는다.

관련 테스트:
- [make-request.test.ts](../../packages/api/src/make-request.test.ts)

### Club Fixture Path Parsing

- club path에서 `clubId`를 추출할 수 있어야 한다.
- club path가 아니면 `undefined`를 반환해야 한다.

관련 테스트:
- [club.fixture.test.ts](../../e2e/fixtures/club.fixture.test.ts)

### Rich Text Normalization

- 공백 문자열은 빈 문자열로 정규화한다.
- 일반 텍스트는 안전한 HTML로 escape한다.
- 이미 HTML인 값은 유지한다.
- rich text viewer는 sanitizer 로드 실패 시에도 pending 상태를 종료할 수 있는 fallback HTML을 반환해야 한다.

관련 테스트:
- [sanitize-rich-text-html.test.ts](../../packages/rich-text/src/sanitize-rich-text-html.test.ts)
- [rich-text-viewer.test.ts](../../packages/rich-text/src/rich-text-viewer.test.ts)

### Date Format

- 날짜 format helper는 입력/출력 규칙을 일관되게 유지해야 한다.

관련 테스트:
- [date.test.ts](../../apps/DONGLE-ADMIN/src/lib/format/date.test.ts)

### String Normalization

- `trimToEmpty`는 문자열 입력의 앞뒤 공백을 제거한다.
- `trimToEmpty`는 nullish 값과 비문자열 입력을 빈 문자열로 정규화한다.
- `trimToNull`은 공백 문자열을 `null`로 정규화한다.

관련 테스트:
- [string.test.ts](../../packages/utils/src/string.test.ts)

### Phone Number Formatting

- 10자리 휴대폰 번호는 `000-000-0000` 형식으로 표시한다.
- 11자리 휴대폰 번호는 `000-0000-0000` 형식으로 표시한다.
- 공백이나 하이픈이 섞여 있어도 표시 형식은 동일해야 한다.
- 휴대폰 번호로 포맷할 수 없는 값은 원본 표시를 유지한다.

관련 테스트:
- [phone.test.ts](../../packages/utils/src/phone.test.ts)

### Session Draft Clear Rule

- draft는 저장 성공으로 막 전이된 시점에만 제거된다.
- 성공 이후 같은 화면에서 다시 수정 중이면 임시저장이 계속 동작해야 한다.

관련 테스트:
- [use-session-storage-draft.test.ts](../../apps/DONGLE-ADMIN/src/hooks/use-session-storage-draft.test.ts)

### SNS URL Normalization

- instagram 값은 handle, 도메인 입력, 전체 URL을 실제 instagram URL로 정규화한다.
- youtube 값은 handle, 전체 URL, 일반 문자열을 실제 youtube URL 또는 검색 URL로 정규화한다.
- 다른 도메인 URL이 들어와도 외부 도메인으로 그대로 이동시키지 않는다.

관련 테스트:
- [normalize-social-url.test.ts](../../apps/DONGLE-CLIENT/src/lib/normalize-social-url.test.ts)

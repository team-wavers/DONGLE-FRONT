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
- [filterable-club-list.test.ts](../../apps/DONGLE-ADMIN/src/components/organics/filterable-club-list.test.ts)

## Club Form

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
- [club-form.validation.test.ts](../../apps/DONGLE-ADMIN/src/feature/club/validation/club-form.validation.test.ts)

## User Form

### 계정 입력 검증

- 공백 loginId는 거부한다.
- 비밀번호는 required 여부에 따라 빈 값 허용 규칙이 달라진다.
- 전화번호는 올바른 휴대폰 형식만 통과한다.
- 사용자 생성 폼은 역할을 입력받지 않고 관리자 계정으로 생성한다.
- 사용자 수정 폼은 역할을 변경하지 않는다.

관련 테스트:
- [user-form.validation.test.ts](../../apps/DONGLE-ADMIN/src/feature/user/validation/user-form.validation.test.ts)
- [user-create-form.action.test.ts](../../apps/DONGLE-ADMIN/src/feature/user/action/user-create-form.action.test.ts)

## Admin User Management

### 검색 필터

- 검색어는 trim 후 소문자 기준으로 비교된다.
- 이름, 로그인 ID, 전화번호, 역할, 소속 동아리명이 검색 대상이다.
- 검색 결과는 일관된 deterministic 로직으로 계산된다.

관련 테스트:
- [filterable-user-list.test.ts](../../apps/DONGLE-ADMIN/src/feature/user/components/filterable-user-list.test.ts)

## Report Create / Update

### 보고서 입력 검증

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
- [activity-report.validation.test.ts](../../apps/DONGLE-ADMIN/src/feature/report/validation/activity-report.validation.test.ts)
- [report-update-payload.test.ts](../../apps/DONGLE-ADMIN/src/feature/report/validation/report-update-payload.test.ts)
- [report-action-error-policy.test.ts](../../apps/DONGLE-ADMIN/src/feature/report/action/report-action-error-policy.test.ts)
- [activity-report-form.action.test.ts](../../apps/DONGLE-ADMIN/src/feature/report/action/activity-report-form.action.test.ts)
- [update-activity-report-form.action.test.ts](../../apps/DONGLE-ADMIN/src/feature/report/action/update-activity-report-form.action.test.ts)

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

## Client Report Detail API

### 상세 조회 상태코드 매핑

- 활동보고서 상세 조회 성공은 200으로 응답한다.
- 목록에서 해당 report를 찾지 못한 경우만 404로 응답한다.
- 목록 조회 자체 실패 등 upstream 실패는 5xx로 응답한다.

관련 테스트:
- [get-club-report-route-status.test.ts](../../apps/DONGLE-CLIENT/src/lib/get-club-report-route-status.test.ts)

## Shared Utilities

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

관련 테스트:
- [sanitize-rich-text-html.test.ts](../../packages/rich-text/src/sanitize-rich-text-html.test.ts)

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

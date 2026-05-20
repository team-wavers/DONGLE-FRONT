# Test Inventory

현재 기본 테스트와 E2E 잔존 범위를 정리한다.

## 기록 원칙

- 이 문서는 “무엇을 어떤 계층에서 검증 중인가”를 적는다.
- 왜 그렇게 판단했는지는 `roadmap.md`와 `known-gaps.md`에 남긴다.
- 기대 동작 자체는 `success-criteria.md`를 기준으로 본다.

## 기본 테스트

| 영역 | 파일 | 검증 방식 | 비고 |
| --- | --- | --- | --- |
| admin club management | [filterable-club-list.test.ts](../../apps/DONGLE-ADMIN/src/components/organics/filterable-club-list.test.ts) | code-graded | 검색 필터 로직 |
| admin shared action | [action-result.test.ts](../../apps/DONGLE-ADMIN/src/shared/action/action-result.test.ts), [zod-field-errors.test.ts](../../apps/DONGLE-ADMIN/src/shared/action/zod-field-errors.test.ts) | code-graded | typed action result helper / zod field error mapper |
| admin shared form | [date-picker-value.test.ts](../../apps/DONGLE-ADMIN/src/shared/form/date-picker-value.test.ts) | code-graded | date picker local date/datetime formatter |
| club register form | [club-register.schema.test.ts](../../apps/DONGLE-ADMIN/src/feature/club/form/club-register.schema.test.ts), [club-register.action.test.ts](../../apps/DONGLE-ADMIN/src/feature/club/form/club-register.action.test.ts) | code-graded | shared RHF/server action schema / 모집 상태 라벨 정규화 / create 후 icon upload 저장 |
| club edit form | [club-edit.schema.test.ts](../../apps/DONGLE-ADMIN/src/feature/club/form/club-edit.schema.test.ts), [club-edit-payload.test.ts](../../apps/DONGLE-ADMIN/src/feature/club/form/club-edit-payload.test.ts), [club-edit.action.test.ts](../../apps/DONGLE-ADMIN/src/feature/club/form/club-edit.action.test.ts) | code-graded | shared RHF/server action schema / update payload mapper / icon upload success data |
| club president form | [club-president.schema.test.ts](../../apps/DONGLE-ADMIN/src/feature/club/form/club-president.schema.test.ts) | code-graded | shared RHF/server action schema |
| club form | [club-form.validation.test.ts](../../apps/DONGLE-ADMIN/src/feature/club/validation/club-form.validation.test.ts) | code-graded | validation |
| user form | [user-form.validation.test.ts](../../apps/DONGLE-ADMIN/src/feature/user/validation/user-form.validation.test.ts), [user-form.schema.test.ts](../../apps/DONGLE-ADMIN/src/feature/user/form/user-form.schema.test.ts) | code-graded | validation / shared RHF server action schema / update payload mapper |
| user create action | [user-form.action.test.ts](../../apps/DONGLE-ADMIN/src/feature/user/form/user-form.action.test.ts) | code-graded | 관리자 생성 role payload |
| admin user management | [filterable-user-list.test.ts](../../apps/DONGLE-ADMIN/src/feature/user/components/filterable-user-list.test.ts) | code-graded | 검색 필터 로직 |
| next cache policy | [cache-tags.test.ts](../../packages/service/src/cache-tags.test.ts), [club.service.test.ts](../../packages/service/src/club/club.service.test.ts), [user.service.test.ts](../../packages/service/src/user/user.service.test.ts) | code-graded | cache tag helper / 공개 조회 cache option / 관리 조회 no-store / mutation service cache option 제외 |
| admin schedule management | [schedule.utils.test.ts](../../apps/DONGLE-ADMIN/src/feature/schedule/schedule.utils.test.ts), [schedule-form.schema.test.ts](../../apps/DONGLE-ADMIN/src/feature/schedule/form/schedule-form.schema.test.ts) | code-graded | 캘린더 날짜 계산 / timezone 없는 월 key와 Seoul 기준 월간 조회 query / 일정 필터 / 시작일시 정렬 / 백엔드 응답 매핑 / 일정 기간 표시 / 목록용 날짜 배지·월별 그룹 / 빈 장소·설명 fallback / 회장 일정 폼 스키마 / 외부 링크 payload 정규화·검증 |
| club schedule service | [club.schedule.service.test.ts](../../packages/service/src/club/club.schedule.service.test.ts), [schedule.action.test.ts](../../apps/DONGLE-ADMIN/src/feature/schedule/action/schedule.action.test.ts) | code-graded | 사용자/회장/관리자 일정 엔드포인트 / query string / 공개 일정 cache tag / 삭제 action 실패 응답 분기 |
| report input | [activity-report.validation.test.ts](../../apps/DONGLE-ADMIN/src/feature/report/validation/activity-report.validation.test.ts), [activity-report.schema.test.ts](../../apps/DONGLE-ADMIN/src/feature/report/form/activity-report.schema.test.ts) | code-graded | validation / shared RHF server action schema |
| report payload | [report-update-payload.test.ts](../../apps/DONGLE-ADMIN/src/feature/report/validation/report-update-payload.test.ts) | code-graded | action-composition helper |
| report action error policy | [report-action-error-policy.test.ts](../../apps/DONGLE-ADMIN/src/feature/report/action/report-action-error-policy.test.ts) | code-graded | error branch policy helper |
| report create action | [activity-report-create.action.test.ts](../../apps/DONGLE-ADMIN/src/feature/report/form/activity-report-create.action.test.ts) | code-graded | upload/service branch mapping |
| report update action | [activity-report-update.action.test.ts](../../apps/DONGLE-ADMIN/src/feature/report/form/activity-report-update.action.test.ts) | code-graded | auth/service branch mapping |
| admin register url | [use-url-generator.test.ts](../../apps/DONGLE-ADMIN/src/hooks/use-url-generator.test.ts) | code-graded | helper |
| admin auth returnTo | [normalize-internal-return-to.test.ts](../../apps/DONGLE-ADMIN/src/feature/auth/utils/normalize-internal-return-to.test.ts) | code-graded | helper |
| admin auth login policy | [login-form-policy.test.ts](../../apps/DONGLE-ADMIN/src/feature/auth/utils/login-form-policy.test.ts) | code-graded | input normalization / error branch helper |
| session draft | [use-session-storage-draft.test.ts](../../apps/DONGLE-ADMIN/src/hooks/use-session-storage-draft.test.ts) | code-graded | helper |
| social url | [normalize-social-url.test.ts](../../apps/DONGLE-CLIENT/src/lib/normalize-social-url.test.ts) | code-graded | shared helper |
| main banner display | [get-display-banner-image-urls.test.ts](../../packages/service/src/main-banner/get-display-banner-image-urls.test.ts), [main-banner.service.test.ts](../../packages/service/src/main-banner/main-banner.service.test.ts), [main-banner-datetime.test.ts](../../apps/DONGLE-ADMIN/src/feature/main-banner/utils/main-banner-datetime.test.ts), [main-banner-form.schema.test.ts](../../apps/DONGLE-ADMIN/src/feature/main-banner/form/main-banner-form.schema.test.ts) | code-graded | display helper / link normalization / admin-user endpoint split / admin detail endpoint / public/no-store cache policy / admin form datetime formatter / shared RHF server action schema |
| api token refresh retry | [make-request.test.ts](../../packages/api/src/make-request.test.ts) | code-graded | auth retry guard helper |
| shared normalization | [string.test.ts](../../packages/utils/src/string.test.ts), [phone.test.ts](../../packages/utils/src/phone.test.ts), [date.test.ts](../../packages/utils/src/date.test.ts), [url.test.ts](../../packages/utils/src/url.test.ts) | code-graded | trim/nullable/phone/date/url normalization and Seoul 기준 display/request/month-key formatting helper |
| club report service | [club.report.service.test.ts](../../packages/service/src/club/club.report.service.test.ts) | code-graded | report list cache policy / admin list no-store / report detail endpoint |
| client search | [use-club-filters.test.ts](../../apps/DONGLE-CLIENT/src/hooks/use-club-filters.test.ts) | code-graded | filtering / summary / query string parser-builder |
| client search empty-state | [club-search-empty-state.test.ts](../../apps/DONGLE-CLIENT/src/lib/club-search-empty-state.test.ts) | code-graded | filter/query/data 조합별 empty-state code/message |
| client club schedule | [club-schedule.test.ts](../../apps/DONGLE-CLIENT/src/lib/club-schedule.test.ts), [club-schedules-tab-content.test.tsx](../../apps/DONGLE-CLIENT/src/components/club-detail/club-schedules-tab-content.test.tsx) | code-graded | 동아리 상세 공개 일정 필터 / 다가오는 일정과 지난 일정 분리 / 시작일시 정렬 / 백엔드 응답 매핑 / 일정 기간 표시 / 외부 링크 정규화 / 외부 링크 CTA 렌더링 / 일정 조회 실패 안내 |
| client club reports | [club-reports-tab-content.test.tsx](../../apps/DONGLE-CLIENT/src/components/club-detail/club-reports-tab-content.test.tsx) | code-graded | 활동보고서 조회 실패 안내 |
| club fixture | [club.fixture.test.ts](../../e2e/fixtures/club.fixture.test.ts) | code-graded | fixture util |
| rich text | [sanitize-rich-text-html.test.ts](../../packages/rich-text/src/sanitize-rich-text-html.test.ts) | code-graded | normalization |
| date util | [date.test.ts](../../apps/DONGLE-ADMIN/src/lib/format/date.test.ts) | code-graded | formatter |

## 잔존 E2E

| 프로젝트 | 파일 | 현재 목적 | 상태 |
| --- | --- | --- | --- |
| admin | [auth.spec.ts](../../e2e/admin/auth.spec.ts) | 관리자 로그인 연결 검증 | 유지 |
| admin | [report-management.spec.ts](../../e2e/admin/report-management.spec.ts) | 동아리 상세 탭 이동 | 유지 |
| club | [auth.spec.ts](../../e2e/club/auth.spec.ts) | 회장 로그인 연결 검증 | 유지 |
| club | [club-form.spec.ts](../../e2e/club/club-form.spec.ts) | 동아리 정보 수정 1건 | 유지 |
| club | [report.spec.ts](../../e2e/club/report.spec.ts) | 활동보고서 작성/삭제 1건 | 유지 |
| client | [smoke.spec.ts](../../e2e/client/smoke.spec.ts) | 메인 진입 | 유지 |

## 최근 정리된 E2E

- `e2e/admin/club-management.spec.ts` 제거
- `e2e/admin/club-register.spec.ts` 제거
- `e2e/club/club-form.spec.ts`에서 단순 렌더링 케이스 제거
- `e2e/club/report.spec.ts`에서 단순 렌더링 케이스 제거

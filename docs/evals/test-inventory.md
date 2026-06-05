# Test Inventory

현재 기본 테스트와 E2E 잔존 범위를 정리한다.

## 기록 원칙

- 이 문서는 “무엇을 어떤 계층에서 검증 중인가”를 적는다.
- 왜 그렇게 판단했는지는 `roadmap.md`와 `known-gaps.md`에 남긴다.
- 기대 동작 자체는 `success-criteria.md`를 기준으로 본다.

## 기본 테스트

| 영역 | 파일 | 검증 방식 | 비고 |
| --- | --- | --- | --- |
| admin club management | [filterable-club-list.test.ts](../../apps/DONGLE-ADMIN/src/feature/club/components/filterable-club-list/filterable-club-list.test.ts) | code-graded | 검색 필터 로직 |
| admin shared action | [action-result.test.ts](../../apps/DONGLE-ADMIN/src/shared/action/action-result.test.ts), [zod-field-errors.test.ts](../../apps/DONGLE-ADMIN/src/shared/action/zod-field-errors.test.ts) | code-graded | typed action result helper / zod field error mapper |
| admin shared form | [date-picker-value.test.ts](../../apps/DONGLE-ADMIN/src/shared/form/date-picker-value.test.ts), [rhf-file-upload.test.ts](../../apps/DONGLE-ADMIN/src/shared/form/rhf-file-upload.test.ts) | code-graded | date picker local date/datetime formatter / replace file upload cancel restore helper |
| club register form | [club-register.schema.test.ts](../../apps/DONGLE-ADMIN/src/feature/club/form/club-register.schema.test.ts), [club-register.action.test.ts](../../apps/DONGLE-ADMIN/src/feature/club/form/club-register.action.test.ts) | code-graded | shared RHF/server action schema / 모집 상태 라벨 정규화 / create 후 icon upload 저장 |
| club edit form | [club-edit.schema.test.ts](../../apps/DONGLE-ADMIN/src/feature/club/form/club-edit.schema.test.ts), [club-edit-payload.test.ts](../../apps/DONGLE-ADMIN/src/feature/club/form/club-edit-payload.test.ts), [club-edit.action.test.ts](../../apps/DONGLE-ADMIN/src/feature/club/form/club-edit.action.test.ts) | code-graded | shared RHF/server action schema / update payload mapper / icon upload success data |
| club president form | [club-president.schema.test.ts](../../apps/DONGLE-ADMIN/src/feature/club/form/club-president.schema.test.ts) | code-graded | shared RHF/server action schema |
| club form | [club-form.validation.test.ts](../../apps/DONGLE-ADMIN/src/feature/club/validation/club-form.validation.test.ts) | code-graded | validation |
| user form | [user-form.validation.test.ts](../../apps/DONGLE-ADMIN/src/feature/user/validation/user-form.validation.test.ts), [user-form.schema.test.ts](../../apps/DONGLE-ADMIN/src/feature/user/form/user-form.schema.test.ts) | code-graded | validation / shared RHF server action schema / update payload mapper |
| user create action | [user-form.action.test.ts](../../apps/DONGLE-ADMIN/src/feature/user/form/user-form.action.test.ts) | code-graded | 관리자 생성 role payload |
| admin user management | [filterable-user-list.test.ts](../../apps/DONGLE-ADMIN/src/feature/user/components/filterable-user-list.test.ts) | code-graded | 검색 필터 로직 |
| next cache policy | [cache-tags.test.ts](../../packages/service/src/cache-tags.test.ts), [club.service.test.ts](../../packages/service/src/club/club.service.test.ts), [user.service.test.ts](../../packages/service/src/user/user.service.test.ts) | code-graded | cache tag helper / 공개 조회 cache option / 관리 조회 no-store / mutation service cache option 제외 |
| schedule display helper | [schedule-display.test.ts](../../packages/ui/src/schedules/schedule-display.test.ts) | code-graded | Seoul 기준 일정 날짜 배지 / 기간 표시 formatter / 월별 그룹 병합 helper |
| admin schedule management | [schedule.utils.test.ts](../../apps/DONGLE-ADMIN/src/feature/schedule/schedule.utils.test.ts), [schedule-form.schema.test.ts](../../apps/DONGLE-ADMIN/src/feature/schedule/form/schedule-form.schema.test.ts), [use-club-schedule-submit.test.ts](../../apps/DONGLE-ADMIN/src/feature/schedule/form/use-club-schedule-submit.test.ts), [schedule-form-dialog-state.test.ts](../../apps/DONGLE-ADMIN/src/feature/schedule/components/schedule-form-dialog-state.test.ts), [schedule-list-item.test.tsx](../../apps/DONGLE-ADMIN/src/feature/schedule/components/schedule-list-item.test.tsx) | code-graded | 캘린더 날짜 계산 / timezone 없는 월 key와 Seoul 기준 월간 조회 query / 일정 필터 / 시작·종료일시 기준 일정 상태 판단 / 진행 중 분리와 현재 기준 가까운 순 정렬 / 백엔드 응답 매핑 / 공통 일정 라벨 매핑 / 일정 기간 표시 / 날짜 아젠다 없는 월별 그룹 / 관리자 일정 목록 동아리명 우선 표시 / 빈 장소·설명 fallback / 회장 일정 폼 스키마 / 일정 폼 다이얼로그 닫힘 전환 중 수정 대상 표시 유지 / 외부 링크 payload 정규화·검증 / 공통·동아리 일정 생성·수정 submit action 분기 |
| club schedule service | [club.schedule.service.test.ts](../../packages/service/src/club/club.schedule.service.test.ts), [schedule.action.test.ts](../../apps/DONGLE-ADMIN/src/feature/schedule/action/schedule.action.test.ts) | code-graded | 사용자/회장/관리자 일정 엔드포인트 / public 전체 일정 엔드포인트 / 관리자 공통 일정 생성·수정 엔드포인트 / query string / 공개 일정 cache tag / 관리자 일정 수정·공개 상태 변경 동아리 범위 tag / 관리자 삭제 동아리 범위 tag / 관리자 삭제 전 상세 조회 실패 시 삭제 중단 / 삭제 action 실패 응답 분기 |
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
| main banner display | [get-display-banner-image-urls.test.ts](../../packages/service/src/main-banner/get-display-banner-image-urls.test.ts), [main-banner.service.test.ts](../../packages/service/src/main-banner/main-banner.service.test.ts), [main-banner-datetime.test.ts](../../apps/DONGLE-ADMIN/src/feature/main-banner/utils/main-banner-datetime.test.ts), [main-banner-form.schema.test.ts](../../apps/DONGLE-ADMIN/src/feature/main-banner/form/main-banner-form.schema.test.ts) | code-graded | display helper / link normalization / admin-user endpoint split / admin detail endpoint / admin detail exception normalization / public/no-store cache policy / admin form datetime formatter / shared RHF server action schema |
| api token refresh retry | [make-request.test.ts](../../packages/api/src/make-request.test.ts) | code-graded | auth retry guard helper |
| shared normalization | [string.test.ts](../../packages/utils/src/string.test.ts), [phone.test.ts](../../packages/utils/src/phone.test.ts), [date.test.ts](../../packages/utils/src/date.test.ts), [url.test.ts](../../packages/utils/src/url.test.ts) | code-graded | trim/nullable/phone/date/url normalization and Seoul 기준 display/request/month-key/timestamp helper |
| club report service | [club.report.service.test.ts](../../packages/service/src/club/club.report.service.test.ts) | code-graded | report list cache policy / admin list no-store / report detail endpoint / report detail not-found message normalization |
| client analytics | [analytics.test.ts](../../apps/DONGLE-CLIENT/src/lib/analytics.test.ts) | code-graded | PostHog 이벤트 이름 / 허용 속성 / non-browser no-op |
| client search | [use-club-filters.test.ts](../../apps/DONGLE-CLIENT/src/hooks/use-club-filters.test.ts) | code-graded | filtering / recruiting count helper / summary / query string parser-builder |
| client search empty-state | [club-search-empty-state.test.ts](../../apps/DONGLE-CLIENT/src/lib/club-search-empty-state.test.ts) | code-graded | filter/query/data 조합별 empty-state code/message |
| client club schedule | [club-schedule.test.ts](../../apps/DONGLE-CLIENT/src/lib/club-schedule.test.ts), [public-schedule-calendar.test.ts](../../apps/DONGLE-CLIENT/src/lib/public-schedule-calendar.test.ts), [club-schedules-tab-content.test.tsx](../../apps/DONGLE-CLIENT/src/components/club-detail/club-schedules-tab-content.test.tsx), [public-schedule-calendar.test.tsx](../../apps/DONGLE-CLIENT/src/components/schedules/public-schedule-calendar.test.tsx), [header-schedule-link.test.tsx](../../apps/DONGLE-CLIENT/src/components/navigation/header-schedule-link.test.tsx) | code-graded | 동아리 상세 공개 일정 필터 / 진행 중·다가오는 일정·지난 일정 분리 / 진행 중·예정·지난 일정 정렬 / 진행 중 별도 섹션 / 예정·지난 일정 월별 섹션 / 백엔드 응답 매핑 / 공통 일정 clubId null 유지와 총동연 라벨 / 사용자 전체 일정 캘린더와 월별 목록 표시 / 헤더 전체 일정 전역 진입점과 현재 페이지 상태 / 날짜 아젠다 없는 일정 기간·월별 그룹 표시 / 일정 유형별 태그 색상 / 외부 링크 정규화 / 외부 링크 CTA 렌더링 / 일정 조회 실패 안내 |
| client loading ux | [page-skeletons.test.tsx](../../apps/DONGLE-CLIENT/src/components/loading/page-skeletons.test.tsx), [club-intro-tab-content.test.tsx](../../apps/DONGLE-CLIENT/src/components/club-detail/club-intro-tab-content.test.tsx), [club-detail-tabs.test.tsx](../../apps/DONGLE-CLIENT/src/components/club-detail/club-detail-tabs.test.tsx) | code-graded | 동아리 상세 / 활동보고서 상세 스켈레톤 주요 구조 / 소개 탭 rich text 지연 중 빈 렌더링 / 상세 탭 content slot |
| client club reports | [club-reports-tab-content.test.tsx](../../apps/DONGLE-CLIENT/src/components/club-detail/club-reports-tab-content.test.tsx) | code-graded | 활동보고서 조회 실패 안내 |
| club fixture | [club.fixture.test.ts](../../e2e/fixtures/club.fixture.test.ts) | code-graded | fixture util |
| rich text | [sanitize-rich-text-html.test.ts](../../packages/rich-text/src/sanitize-rich-text-html.test.ts), [rich-text-viewer.test.ts](../../packages/rich-text/src/rich-text-viewer.test.ts) | code-graded | normalization / viewer sanitizer failure fallback |
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

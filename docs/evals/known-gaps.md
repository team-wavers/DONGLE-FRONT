# Known Gaps

현재 테스트 체계에서 아직 충분히 옮기지 못한 영역을 정리한다.

## 이 문서에 적는 것

- 이미 필요성을 인지했지만 아직 `test`로 옮기지 못한 공백
- 바로 E2E로 만들지 않고 보류 중인 항목
- 테스트 불가 사유가 남아 있는 영역

## 이 문서에 적지 않는 것

- 이미 완료한 작업
- 현재 기본 명령이나 환경 설정 자체의 설명
- 장기 구조 개편 단계

## 우선순위 높은 공백

- 동아리 등록이 회장 사용자 생성 이후 동아리 생성 실패를 롤백하지 않는다. 보상 삭제/트랜잭션이 없어 고아 계정이 남을 수 있다 (`club-register.action.ts`, 01-domain P1-3)
- 회장 수정 action은 스키마 테스트만 있고, 서비스 실패 시 `revalidateTags` 미호출이 검증되지 않는다 (`club-president.action.ts`, 06-test-ci P1-5)
- ADMIN viewport pinch zoom 차단 금지, CLIENT `loading.tsx` 라우트 파일 존재, 배너 내부=같은 탭/외부=새 탭은 테스트가 없다 (06-test-ci P2-8)
- PR CI `pnpm build`는 `NEXT_PUBLIC_USE_MSW=1`이고 운영 standalone 빌드와 env가 다르다. 배포 job `cancel-in-progress: true`는 테스트 자산 밖 운영 공백이다 (06-test-ci P0-2, P1-7)
- 실제 로그인 연결(쿠키 전송·실서버 라우팅)은 `loginFormAction` unit test만으로는 닫히지 않는다. 기존 auth E2E는 PR/배포 게이트에 없다

## 이미 닫힌 항목 (인벤토리로 이동)

- admin auth 입력 검증과 로그인 후 redirect 판단 (`login-form-policy.test.ts`, `resolve-post-login-path.test.ts`)
- `loginFormAction`의 서비스 실패/JWT decode 실패/쿠키 설정 (`login-form.action.test.ts`)
- client 메인 empty-state 분기 (`club-search-empty-state.test.ts`, `club-list-section.test.tsx`)
- form/action 문자열 정규화와 payload mapping (club/user/report/schedule 스키마·payload 테스트)
- 배너 timezone-less 게시 기간과 `/\` 오픈리다이렉트 (`get-display-banner-image-urls.test.ts`, `page.test.ts`)
- `makeRequest` 401 → refresh → 1회 재시도 루프 (`make-request.test.ts`)
- 활동보고서 상세 404 vs 5xx 분기 (`reports/[reportId]/page.test.ts`)

## 의도적으로 남긴 E2E

- 실제 로그인 연결 검증
- 실제 제출 후 목록/상세 반영 확인
- 실제 라우팅 연결 확인

## 지금 하지 않는 것

- E2E를 늘리기 위한 하네스 확장
- stateful mock 인프라 확대
- `isolated` 모드 추가
- `@dongle/content` / `@dongle/types` Vitest project 등록 (해당 패키지에 테스트 파일이 생기기 전까지 실해가 없다)

## 재검토 조건

- 기본 테스트만으로 회귀를 잡기 어렵다는 사례가 반복될 때
- CI에서 연결 검증 누락이 잦아질 때
- 실제 사용자 플로우 문제를 `test`만으로 재현하기 어려운 영역이 늘어날 때
- `@dongle/content` 또는 `@dongle/types`에 테스트가 추가될 때 Vitest project 등록을 다시 본다

## 기록 규칙

- `test`로 옮길 수 없는 이유가 있으면 이 문서에 남긴다.
- “나중에 보자” 수준의 막연한 메모는 남기지 않는다.
- 왜 `test`로 안 되는지, 무엇이 E2E 후보인지, 재검토 조건이 무엇인지 같이 적는다.

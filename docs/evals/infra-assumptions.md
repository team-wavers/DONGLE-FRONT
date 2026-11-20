# Infra Assumptions

이 문서는 현재 평가 체계에서 기본 검증 경로와 E2E의 환경 가정을 분리해서 정리한다.

## 기본 경로

- 기본 검증은 `pnpm verify:fast`다.
- `verify:fast`는 `verify:docs`, `verify:vitest-alias`, `type`, `Vitest`를 포함한다.
- `type`은 Playwright 설정과 E2E 소스의 타입도 검사한다.
- 따라서 기본 경로는 앱 서버 기동, 브라우저 기동, 외부 네트워크 의존성을 요구하지 않아야 한다.

## 기본 경로 금지 규칙

기본 경로에서는 아래를 금지한다.

- 외부 네트워크 접근
- 실제 앱 서버 기동
- 브라우저 의존 검증
- 시간 지연에 의존하는 assertion
- 랜덤값에 의존하는 assertion
- 외부 API 호출

## 기본 경로 허용 범위

기본 경로에서는 아래만 기본 대상으로 본다.

- 로컬 파일 기준 문서 계약 검사
- 타입 검사
- Vitest 기반 순수 로직 테스트
- deterministic helper / validation / transform 검증

## E2E 관련 현재 가정

- PR CI의 Playwright Chromium 설치와 스모크는 `ubuntu-24.04`에서 실행한다. Playwright 1.58.2가 지원하는 OS를 유지하도록 러너의 Ubuntu 버전을 명시한다.
- E2E는 기본 경로가 아니다.
- Playwright는 현재 `reuseExistingServer`를 우선 사용한다.
- project별로 필요한 서버만 기동하도록 분리되어 있다.
- 로컬에서는 이미 켜진 dev 서버가 있으면 재사용한다.

## 개발 배포 E2E 설정

- `pnpm test:e2e:dev`는 별도 Playwright 설정으로 배포된 dev ADMIN과 API를 사용한다. 로컬 서버와 MSW 스모크 설정은 기존 명령에서 사용한다.
- 프런트 저장소 수준 변수 `E2E_ADMIN_URL`을 `https://admin.dev.dongle.wavers.kr`, `E2E_API_URL`을 `https://api.dev.dongle.wavers.kr/v1`로 설정한다. `E2E_VERCEL_PROJECT_ID`는 ADMIN 프로젝트 ID로 설정한다. 프로젝트 필터는 job 실행 전에 평가되므로 Environment 변수에만 두면 안 된다.
- development Environment 또는 저장소 시크릿 `E2E_ADMIN_PASSWORD`와 `E2E_CLUB_PASSWORD`를 서버 시드와 같은 비밀번호로 등록한다. 계정 아이디는 `dongle_e2e_admin`, `dongle_e2e_president`다.
- Vercel 배포 보호가 켜져 있으면 `VERCEL_AUTOMATION_BYPASS_SECRET`을 등록한다. 브라우저는 ADMIN origin에만 해당 헤더를 전달한다.
- ADMIN의 Vercel dev 환경에 `API_URL`, dev API 액세스 서명 키와 동일한 `JWT_SECRET`, `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`를 설정한다. 기존 ADMIN 헬스체크는 API와 Server Actions 설정을 확인한다.
- 워크플로 정의는 GitHub 기본 브랜치에도 등록돼야 한다. dev PR만 반영한 상태에서는 repository_dispatch 자동 실행이 활성화되지 않는다. 프런트 워크플로를 기본 브랜치까지 반영한 뒤 수동으로 dev ref에서 실행한다.
- 서버 development Environment에는 프런트 Actions write 권한의 `FRONT_E2E_DISPATCH_TOKEN`이 필요하다. 서버 dev 배포 성공 후에만 프런트 워크플로를 호출한다. 서버 PR CI에서는 호출하지 않는다.
- Vercel 이벤트는 프로젝트 ID와 dev 브랜치를 필터링한다. 검사 대상은 설정된 고정 dev ADMIN URL이며, 이벤트의 프런트 SHA 및 서버 dispatch의 서버 SHA와 헬스 응답을 비교한다.
- Vercel에서 dev 브랜치를 프로젝트의 Production Branch로 설정해도 프로젝트 ID와 Git dev ref로 판별한다. Vercel의 environment 이름만으로 개발 환경을 제외하지 않는다.
- 공유 dev API 배포가 검사 도중 갱신되면 환경 불일치로 재실행해야 한다. 고정 URL의 배포 버전 불일치는 성공으로 처리하지 않는다.
- 인증 데이터가 포함되는 trace·영상·스크린샷과 세션 파일은 업로드하지 않는다. Actions step과 검사 제목으로 실패 위치를 확인하고 요약에 기대 배포 SHA를 기록한다.

## 기본 경로와 E2E의 경계

- 기본 경로는 코드/로직 검증이다.
- E2E는 실제 연결 검증이다.
- 기본 경로에서 해결 가능한 문제를 E2E로 올리지 않는다.

## 실패 분류 기준

### `pnpm verify:fast` 실패

- 우선 code/product 문제로 분류한다.
- 타입 오류, import 오류, test failure부터 먼저 해결한다.

### E2E 실패

- 앱 문제
- 플로우 문제
- 환경 문제

위 셋 중 어디인지 나누기 전까지는 미분류 상태로 둔다.

### 현재 단계의 noise accounting

- 기본 경로의 실패는 infra noise보다 code 문제 가능성을 우선 본다.
- E2E 재도입 전까지 infra noise는 최소 기록만 유지한다.

## E2E 재도입 시 문서화할 항목

- CPU / RAM
- timeout
- `reuse` / `isolated` 실행 모드
- startup command
- 외부 API 의존성
- flake 분류 기준
- infra failure와 product failure의 구분 기준

## 참고

에이전트형 coding eval에서는 환경 설정 자체가 결과에 영향을 줄 수 있으므로, E2E를 다시 중요 계층으로 올릴 경우 환경 스펙을 평가 설정의 일부로 취급해야 한다.

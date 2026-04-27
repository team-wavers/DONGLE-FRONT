# Infra Assumptions

이 문서는 현재 평가 체계에서 기본 검증 경로와 E2E의 환경 가정을 분리해서 정리한다.

## 기본 경로

- 기본 검증은 `pnpm verify:fast`다.
- `verify:fast`는 `verify:docs`, `type`, `Vitest`를 포함한다.
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

- E2E는 기본 경로가 아니다.
- Playwright는 현재 `reuseExistingServer`를 우선 사용한다.
- project별로 필요한 서버만 기동하도록 분리되어 있다.
- 로컬에서는 이미 켜진 dev 서버가 있으면 재사용한다.

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

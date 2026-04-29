# Evals

이 디렉터리는 이 레포의 평가 체계를 문서화한다.

## 목적

- 코드보다 먼저 성공 기준을 명시한다.
- 어떤 검증이 어떤 리스크를 커버하는지 드러낸다.
- E2E를 기본 경로로 두지 않고도 품질 상태를 추적할 수 있게 만든다.

## 기본 명령

- 이 레포의 기본 진입 명령은 `pnpm verify:fast`다.
- `pnpm verify:docs`는 문서 계약 확인용 하위 명령이다.
- `pnpm test`와 `pnpm test:e2e`는 하위 명령이다.
- 문서에서 기본 검증 경로를 설명할 때는 `pnpm verify:fast`를 기준으로 삼는다.

## 문서 경계

- `AGENTS.md`는 에이전트 시작/종료 계약을 둔다.
- `docs/evals/*`는 성공 기준, 인벤토리, 공백, 우선순위, 환경 가정을 기록한다.
- 하네스 설계/정비용 문서는 별도로 분리하며, 작업 중 에이전트가 직접 따르는 운영 문서로 쓰지 않는다.

## 문서 구성

- [success-criteria.md](success-criteria.md)
  - 도메인별 성공 기준
- [test-inventory.md](test-inventory.md)
  - 현재 테스트 파일과 커버 범위
- [known-gaps.md](known-gaps.md)
  - 아직 테스트로 옮기지 못한 공백
- [roadmap.md](roadmap.md)
  - 현재 진행 상태와 보류 항목
- [infra-assumptions.md](infra-assumptions.md)
  - E2E 재도입 시 참고할 환경 가정

## Artifact Map

작업 종류에 따라 같이 갱신해야 하는 문서는 아래를 기준으로 삼는다.

### 새 validation 추가

- [success-criteria.md](success-criteria.md)
- 관련 `test`
- 필요 시 [test-inventory.md](test-inventory.md)

### 새 helper / formatter / parser / payload transform 추가

- [success-criteria.md](success-criteria.md)
- 관련 `test`
- [test-inventory.md](test-inventory.md)

### 새 action-composition / fixture utility 추가

- [success-criteria.md](success-criteria.md)
- 관련 `test`
- [test-inventory.md](test-inventory.md)

### 기존 E2E를 `test`로 전환

- [test-inventory.md](test-inventory.md)
- [roadmap.md](roadmap.md)
- 필요 시 [known-gaps.md](known-gaps.md)

### 새 E2E 추가 또는 `test`를 E2E로 승격

- [roadmap.md](roadmap.md)
- 필요 시 [infra-assumptions.md](infra-assumptions.md)
- 필요 시 [known-gaps.md](known-gaps.md)

### 테스트로 옮기지 못한 공백 기록

- [known-gaps.md](known-gaps.md)

### 테스트 파일 추가/삭제

- [test-inventory.md](test-inventory.md)
- 성공 기준 영향이 있으면 [success-criteria.md](success-criteria.md)
- 테스트로 옮기지 못한 근거가 생기면 [known-gaps.md](known-gaps.md)

예시:
- `apps/DONGLE-ADMIN/src/feature/foo/foo.validation.test.ts`를 추가했다면 인벤토리 표에 파일/검증방식/비고를 추가한다.
- 기존 E2E를 제거하고 `test`로 전환했다면 인벤토리에서 E2E 잔존 범위를 갱신하고, 필요 시 성공 기준 링크를 최신화한다.
- 인증/라우팅 의존으로 `test` 전환이 불가능해 제외했다면 공백 사유를 `known-gaps.md`에 1줄로 남긴다.

### 우선순위 / 보류 판단 변경

- [roadmap.md](roadmap.md)

### 환경 제약 또는 하네스 가정 변경

- [infra-assumptions.md](infra-assumptions.md)

## 사용 원칙

- 성공 기준이 바뀌었는데 `success-criteria.md`를 갱신하지 않으면 평가 체계 변경으로 보지 않는다.
- 테스트 범위가 바뀌었는데 `test-inventory.md`를 갱신하지 않으면 인벤토리 누락으로 본다.
- 테스트로 못 옮긴 이유가 있는데 `known-gaps.md`에 남기지 않으면 보류 판단이 없는 것으로 본다.
- 우선순위 변경은 `roadmap.md`에 남긴다.
- 환경 제약이나 E2E 실행 가정이 바뀌면 `infra-assumptions.md`에 남긴다.

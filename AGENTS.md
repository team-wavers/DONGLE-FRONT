## PR Review
- Codex가 GitHub PR 리뷰를 작성할 때는 항상 한국어로 작성한다.
- 리뷰 요약, 지적 사항, 변경 제안은 모두 한국어로 작성한다.
- 코드 식별자, 에러 메시지, 로그, 커밋 해시는 원문 그대로 유지한다.

## Commit and PR
- 커밋 메시지는 항상 한국어로 작성한다.
- PR 제목과 PR 본문은 항상 한국어로 작성한다.
- 코드 식별자, 파일 경로, 에러 메시지, 로그, 커밋 해시는 원문 그대로 유지한다.
- PR 본문에는 변경 요약, 검증 결과, 남은 리스크를 한국어로 작성한다.

## Sub-agent Review Authorization
- 서브에이전트 코드 리뷰는 큰 기능 추가, 도메인 로직 변경, payload transform, validation, parser, shared helper 변경처럼 변경 범위가 크거나 회귀 위험이 있는 TDD 작업에만 맡긴다.
- 단일 formatter 표시 변경, 단순 helper 제거, rename, import 정리, 스타일/UI 배치 조정처럼 영향 범위가 좁은 작업은 TDD를 적용했더라도 서브에이전트 리뷰 대상에서 제외한다.
- 서브에이전트 리뷰를 맡기는 경우에는 버그, 회귀 위험, 테스트 공백, 계약 위반을 우선 확인하게 한다.

## Harness Contract
- 시작 전에 [docs/evals/README.md](docs/evals/README.md), [docs/evals/success-criteria.md](docs/evals/success-criteria.md), [docs/evals/test-inventory.md](docs/evals/test-inventory.md), [docs/evals/known-gaps.md](docs/evals/known-gaps.md), [docs/evals/roadmap.md](docs/evals/roadmap.md) 를 먼저 확인한다.
- 기본 검증 경로는 `type -> test`다.
- 기본 테스트 러너는 `Vitest`다.
- pure logic, validation, formatter, parser, helper, payload transform은 `test` 우선이다.
- 인증, 라우팅, 실서버 연결이 꼭 필요한 경우만 E2E 후보다.
- 브라우저 UI 존재 여부 확인만 하는 케이스는 E2E로 만들지 않는다.
- 기본 진입 명령은 `pnpm verify:fast`다.

## Large Change / TDD Contract
- 큰 기능 추가, 도메인 로직 변경, payload transform, validation, parser, formatter, helper 변경은 TDD 흐름을 우선한다.
- 구현 전에 먼저 실패하는 테스트 또는 테스트 계획을 작성한다.
- 테스트가 새 성공 기준을 올바르게 표현하는지 사용자에게 먼저 확인받는다.
- 사용자 확인 후 실제 구현을 진행하고, 작성한 테스트가 통과하는지 검증한다.
- TDD를 적용한 작업 중에서도 변경 범위가 크거나 회귀 위험이 있는 경우에만 구현과 검증 후 서브에이전트 코드 리뷰를 맡긴다.
- 단순 rename, import 정리, 스타일 조정, UI 배치 변경처럼 순수 로직 검증 가치가 낮은 작업은 TDD 대상에서 제외할 수 있다.
- TDD를 적용하지 않았다면 종료 보고에 이유를 남긴다.

## Done Contract
- 성공 기준이 바뀌면 관련 문서를 같이 갱신한다.
- 새 pure logic, validation, helper, payload transform이 생기면 `test` 추가 여부를 확인한다.
- 테스트를 추가하지 않았다면 이유를 남긴다.
- 종료 전 `pnpm verify:fast` 결과를 확인한다.
- 남은 리스크나 후속 작업이 있으면 1줄로 남긴다.

## Failure Contract
- 타입 실패면 테스트 추가보다 타입 문제를 먼저 해결한다.
- `test`로 옮기기 어려운 공백은 [docs/evals/known-gaps.md](docs/evals/known-gaps.md) 에 기록한다.
- E2E 필요성이 생기면 바로 구현하지 말고 먼저 [docs/evals/roadmap.md](docs/evals/roadmap.md) 에 승격 근거를 남긴다.
- `pnpm verify:fast` 실패는 우선 code/product 문제로 본다.
- E2E 실패는 앱, 플로우, 환경 문제를 분리하기 전까지 미분류 상태로 본다.

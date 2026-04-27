## PR Review
- Codex가 GitHub PR 리뷰를 작성할 때는 항상 한국어로 작성한다.
- 리뷰 요약, 지적 사항, 변경 제안은 모두 한국어로 작성한다.
- 코드 식별자, 에러 메시지, 로그, 커밋 해시는 원문 그대로 유지한다.

## Harness Contract
- 시작 전에 [docs/evals/README.md](docs/evals/README.md), [docs/evals/success-criteria.md](docs/evals/success-criteria.md), [docs/evals/test-inventory.md](docs/evals/test-inventory.md), [docs/evals/known-gaps.md](docs/evals/known-gaps.md), [docs/evals/roadmap.md](docs/evals/roadmap.md) 를 먼저 확인한다.
- 기본 검증 경로는 `type -> test`다.
- 기본 테스트 러너는 `Vitest`다.
- pure logic, validation, formatter, parser, helper, payload transform은 `test` 우선이다.
- 인증, 라우팅, 실서버 연결이 꼭 필요한 경우만 E2E 후보다.
- 브라우저 UI 존재 여부 확인만 하는 케이스는 E2E로 만들지 않는다.
- 기본 진입 명령은 `pnpm verify:fast`다.

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

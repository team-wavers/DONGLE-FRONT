# Harness Roadmap

이 문서는 이 레포에서 하네스 엔지니어링을 어떤 순서로 정리할지에 대한 단계별 실행 계획이다.

이 문서는 에이전트가 작업 중 직접 따라야 하는 운영 문서가 아니라, 이 프로젝트의 하네스 설정을 정비하거나 개편할 때 참고하는 설계 문서다.

핵심은 개념 목록을 나열하는 것이 아니라, 각 단계마다:

- 어떤 구조를 새로 만들지
- 어떤 파일을 수정할지
- 무엇을 완료 기준으로 볼지
- 다음 단계로 넘어가기 전에 무엇이 갖춰져야 하는지

를 명확히 고정하는 것이다.

## 현재 문서 기준

현재 레포에는 아래 문서가 이미 있다.

- [AGENTS.md](../../AGENTS.md)
- [docs/evals/README.md](../evals/README.md)
- [docs/evals/success-criteria.md](../evals/success-criteria.md)
- [docs/evals/test-inventory.md](../evals/test-inventory.md)
- [docs/evals/known-gaps.md](../evals/known-gaps.md)
- [docs/evals/roadmap.md](../evals/roadmap.md)
- [docs/evals/infra-assumptions.md](../evals/infra-assumptions.md)

현재 상태는 “평가 문서 분리”를 넘어서 기본 계약 일부를 문서와 스크립트로 고정한 단계다.
다만 아직은 최소 계약 검증 수준이며, 문서 내용의 적절성 자체를 강하게 자동 검증하는 단계는 아니다.

## 최종적으로 원하는 상태

완성된 하네스 방향은 아래와 같다.

- 에이전트는 `AGENTS.md`에서 시작 절차와 종료 절차를 바로 읽는다.
- `docs/evals/*`는 상세 기준과 기록 저장소 역할만 한다.
- 기본 검증 경로는 `pnpm verify:fast` 하나로 수렴한다.
- `test`와 E2E의 경계가 문서에 고정된다.
- 실패 시 다음 행동과 기록 위치가 문서에 고정된다.
- 하네스는 무거운 인프라보다 문서화된 계약으로 유지된다.

## 현재 고정된 운영 기준

- 기본 검증 명령은 `pnpm verify:fast`
- 기본 검증 순서는 `type -> test`
- 기본 테스트 러너는 `Vitest`
- E2E는 기본 경로가 아니라 예외 경로

## Routing Decision Table

이 표는 단계 4에서 고정해야 하는 판단 표면이다.

| 변경 종류 | 기본 목적 | 보낼 계층 | 비고 |
| --- | --- | --- | --- |
| validation | 입력 규칙 검증 | `test` | 기본 대상 |
| formatter | 출력 형식 검증 | `test` | 기본 대상 |
| parser | 입력 해석 검증 | `test` | 기본 대상 |
| helper | deterministic helper 검증 | `test` | 기본 대상 |
| payload transform | 요청/응답 조합 검증 | `test` | 기본 대상 |
| action-composition | 얇은 조합 로직 검증 | `test` | 기본 대상 |
| fixture utility | fixture helper 검증 | `test` | 기본 대상 |
| 인증 연결 | 실제 로그인/세션 연결 | E2E 후보 | 꼭 필요할 때만 |
| 라우팅 연결 | 실제 페이지 진입 / redirect | E2E 후보 | 꼭 필요할 때만 |
| 실서버 제출 흐름 | 제출 후 반영 검증 | E2E 후보 | 꼭 필요할 때만 |
| 단순 UI 존재 여부 | 버튼/텍스트 보임 확인 | 금지 | E2E로 두지 않음 |
| fetch interception 위주 가짜 플로우 | mock-heavy 시나리오 | `test` 우선 | E2E 가치 낮음 |

## E2E 금지 케이스

아래 케이스는 원칙적으로 E2E로 만들지 않는다.

- 버튼 존재 여부만 확인하는 케이스
- 텍스트가 보이는지 정도만 확인하는 케이스
- 검색 필터 / 요약 문구 / payload 조합처럼 순수 로직인 케이스
- 실제 연결보다 interception이 핵심인 케이스

## E2E 승격 조건

아래 중 하나를 만족할 때만 E2E 후보로 본다.

- 실제 인증 연결을 확인해야 한다.
- 실제 라우팅 연결을 확인해야 한다.
- 실제 제출 후 목록/상세 반영을 확인해야 한다.
- 브라우저와 서버가 같이 있어야만 드러나는 회귀다.

## 단계별 계획

### 단계 0. Baseline 고정

목적:
- 지금 이미 있는 문서와 명령을 하네스 기준선으로 고정한다.

산출물:
- 이 로드맵 문서

수정 파일:
- 없음

이 단계에서 명시할 것:
- 현재 어떤 문서가 존재하는지
- 기본 검증 명령이 무엇인지
- 현재 구조가 어디까지는 되어 있고 어디부터는 안 되어 있는지

완료 기준:
- “지금 기준선이 무엇인가”를 이 문서 하나에서 설명할 수 있다.
- 이후 단계가 무엇을 바꾸는지 비교 가능한 상태가 된다.

현재 상태:
- 반영됨

다음 단계 진입 조건:
- 없음

### 단계 1. Entry Layer 정리

목적:
- 에이전트가 가장 먼저 읽는 진입 레이어를 고정한다.

만들 구조:
- `AGENTS.md`를 하네스 진입점으로 사용

수정 파일:
- [AGENTS.md](../../AGENTS.md)

넣어야 할 내용:
- 시작 전 확인 절차
- 기본 명령은 `pnpm verify:fast`
- E2E는 기본 경로가 아니라는 점
- 상세 기준 문서로 가는 링크

완료 기준:
- 에이전트가 `AGENTS.md`만 읽어도 시작 행동을 이해한다.
- 더 이상 없는 문서나 쓰지 않는 문서를 진입점으로 참조하지 않는다.

현재 상태:
- 반영됨

현재 반영된 것:
- 기본 검증 경로
- 기본 테스트 러너
- eval 문서 링크
- 시작 전 확인 절차
- `test` 우선 대상
- E2E 후보 조건
- 기본 진입 명령
- eval 문서 링크 실존 여부 검증

남은 작업:
- 필요 시 문구를 더 짧게 다듬는 정도

다음 단계 진입 조건:
- `AGENTS.md`가 실제 진입 문서로 안정화되어 있어야 한다.

### 단계 2. Completion Layer 정리

목적:
- 작업이 끝났다고 볼 조건을 에이전트 레벨에서 고정한다.

만들 구조:
- 완료 계약은 `AGENTS.md`에 짧게 두고, 세부 기준은 eval 문서로 연결

수정 파일:
- [AGENTS.md](../../AGENTS.md)

넣어야 할 내용:
- 관련 성공 기준 문서 갱신 여부 확인
- 테스트 추가 또는 테스트 불필요 사유 명시
- `pnpm verify:fast` 결과 확인
- 남은 리스크 1줄 기록

완료 기준:
- 완료 보고 형식이 문서화된다.
- 테스트/문서/검증 결과 중 무엇을 빠뜨리면 완료가 아닌지 명확해진다.

현재 상태:
- 반영됨

현재 반영된 것:
- 성공 기준 문서 갱신 여부 확인
- `test` 추가 여부 확인
- 테스트 미추가 사유 기록
- `pnpm verify:fast` 기준 확인
- 남은 리스크 1줄 기록

다음 단계 진입 조건:
- Entry Layer가 먼저 고정되어야 한다.

### 단계 3. Artifact Map 정리

목적:
- 어떤 종류의 작업이 어떤 문서를 갱신해야 하는지 구조를 고정한다.

만들 구조:
- `docs/evals/README.md`를 문서 역할 인덱스로 사용
- 로드맵에는 “작업 종류 -> 수정 문서” 맵을 유지

수정 파일:
- [docs/evals/README.md](../evals/README.md)

반영할 규칙:
- 새 validation 추가: `success-criteria.md` + `test`
- helper / payload transform 추가: `success-criteria.md` + `test-inventory.md`
- 테스트 전환: `test-inventory.md` + `docs/evals/roadmap.md`
- 보류 판단: `known-gaps.md` 또는 `docs/evals/roadmap.md`
- 환경 제약 변경: `infra-assumptions.md`

완료 기준:
- 작업 종류별로 수정할 문서를 헷갈리지 않는다.
- 문서 역할이 서로 겹치지 않는다.

현재 상태:
- 반영됨

현재 반영된 것:
- eval 문서 분리
- 작업 종류별 갱신 규칙 명시

남은 작업:
- 새 작업 유형이 생길 때 artifact map 항목을 추가할지 검토

다음 단계 진입 조건:
- Entry / Completion Layer가 대략 정리되어 있어야 한다.

### 단계 4. Routing Layer 정리

목적:
- 어떤 문제를 `test`로 보내고 어떤 문제만 E2E 후보로 둘지 고정한다.

만들 구조:
- 하네스 설정 설계 문서에 라우팅 규칙을 독립 섹션으로 유지

수정 파일:
- 필요 시 [AGENTS.md](../../AGENTS.md)

반영할 규칙:
- deterministic input/output: `test`
- payload mapping / parsing / transform: `test`
- validation / formatter / parser / helper: `test`
- 인증 / 라우팅 / 실서버 연결: E2E 후보
- 브라우저 UI 존재 여부만 보는 케이스: 금지
- fetch interception 비중이 큰 가짜 플로우: 가능한 한 `test`

완료 기준:
- 같은 변경을 두고 에이전트마다 판단이 달라지지 않는다.
- 단순 렌더링 케이스가 다시 E2E로 늘어나지 않는다.

현재 상태:
- 반영됨

현재 반영된 것:
- Routing Decision Table
- E2E 금지 케이스
- E2E 승격 조건

다음 단계 진입 조건:
- Artifact Map이 먼저 있어야 테스트 이동 시 문서 갱신이 흔들리지 않는다.

### 단계 5. Environment Layer 정리

목적:
- 기본 경로를 환경 노이즈에서 최대한 분리한다.

만들 구조:
- 환경 계약은 `infra-assumptions.md`에 둔다.
- 하네스 설정 설계 문서에는 “기본 경로 금지 규칙”만 요약한다.

수정 파일:
- [docs/evals/infra-assumptions.md](../evals/infra-assumptions.md)

반영할 규칙:
- 기본 경로는 네트워크 없음
- 기본 경로는 서버 기동 없음
- 기본 경로는 시간 의존 없음
- 기본 경로는 랜덤 의존 없음
- 기본 경로는 외부 API 없음

완료 기준:
- `verify:fast`가 환경 노이즈 없는 기본 경로로 문서화된다.
- E2E와 기본 경로의 환경 요구사항이 분리된다.

현재 상태:
- 반영됨

현재 반영된 것:
- infra assumptions에 기본 경로와 E2E 가정이 정리됨
- 기본 경로 금지 규칙이 문서화됨
- `verify:fast` 구성과 허용 범위가 문서에 반영됨

남은 작업:
- 기본 경로 금지 규칙을 다른 진입 문서에서도 일관되게 요약할지 결정

다음 단계 진입 조건:
- Routing Layer가 먼저 있어야 기본 경로 정의가 흔들리지 않는다.

### 단계 6. Failure Layer 정리

목적:
- 실패했을 때 다음 행동과 기록 방식을 고정한다.

만들 구조:
- fallback 규칙은 `AGENTS.md`
- 공백 기록은 `known-gaps.md`
- 실패 분류는 `infra-assumptions.md` / `docs/evals/roadmap.md`

수정 파일:
- [AGENTS.md](../../AGENTS.md)
- [docs/evals/known-gaps.md](../evals/known-gaps.md)
- [docs/evals/infra-assumptions.md](../evals/infra-assumptions.md)
- [docs/evals/roadmap.md](../evals/roadmap.md)

반영할 규칙:
- 타입 실패면 테스트 추가보다 타입부터 해결
- 테스트로 옮길 수 없으면 `known-gaps.md`에 남김
- E2E 필요성이 생기면 바로 구현하지 말고 먼저 `docs/evals/roadmap.md`에 근거 기록
- `verify:fast` 실패는 우선 product/code 문제
- E2E 실패는 앱 / 플로우 / 환경 미분류 상태

완료 기준:
- 실패 시 다음 행동이 문서화된다.
- product failure와 harness failure를 최소 수준으로 구분한다.

현재 상태:
- 반영됨

반영 대상:
- `AGENTS.md`
- `docs/evals/known-gaps.md`
- `docs/evals/infra-assumptions.md`
- `docs/evals/roadmap.md`

현재 반영된 것:
- 실패 시 다음 행동 규칙
- 공백 기록 규칙
- `verify:fast` 실패 분류
- E2E 실패 분류
- E2E 승격 기록 규칙
- 문서 계약 최소 자동 검증

다음 단계 진입 조건:
- Completion Layer와 Environment Layer가 먼저 정리되어야 한다.

### 단계 7. Command Surface 고정

목적:
- 기본 진입 명령을 하나로 유지하는 운영 표면을 고정한다.

만들 구조:
- 기본 명령은 `pnpm verify:fast`
- 서브 명령은 있어도, 기본 진입 명령은 문서 전반에서 하나만 안내

수정 파일:
- [AGENTS.md](../../AGENTS.md)
- 필요 시 eval 문서들

완료 기준:
- “무엇을 돌려야 하나”에 대한 기본 답이 하나다.
- 문서마다 기본 명령이 달라지지 않는다.

현재 상태:
- 반영됨

현재 반영된 것:
- 기본 명령이 `pnpm verify:fast`라는 기준은 이미 있음
- `AGENTS.md`, `docs/evals/README.md`, `docs/evals/roadmap.md`, `docs/evals/infra-assumptions.md`에서 기본 명령을 같은 기준으로 안내

유지 리스크:
- 다른 문서에서 다른 기본 명령을 안내하면 다시 약해진다.

## 단계 간 의존 관계

- 단계 1 없이 단계 2를 해도 완료 조건이 실제 진입 문서에 안 붙는다.
- 단계 1, 2 없이 단계 3만 해도 문서 역할은 생기지만 에이전트 행동은 안 바뀐다.
- 단계 3 없이 단계 4를 하면 테스트 이동 시 문서 갱신이 흔들린다.
- 단계 4 없이 단계 5를 하면 기본 경로 정의가 공허해진다.
- 단계 2, 5 없이 단계 6을 하면 실패 후 행동 규칙이 문서상만 존재하게 된다.
- 단계 7은 마지막 단계가 아니라 모든 단계에서 유지해야 하는 기준이다.

## 권장 실행 순서

1. 단계 1: Entry Layer
2. 단계 2: Completion Layer
3. 단계 3: Artifact Map
4. 단계 4: Routing Layer
5. 단계 5: Environment Layer
6. 단계 6: Failure Layer
7. 단계 7: Command Surface 유지 확인

## 단계별 완료 체크

각 단계 완료 시 아래를 확인한다.

- 수정 파일이 실제로 반영되었는가
- source of truth가 하나로 유지되는가
- 없는 문서를 참조하지 않는가
- 기본 명령이 `pnpm verify:fast`로 유지되는가
- 다음 단계로 넘어가기 위한 선행 조건이 충족되었는가

## 지금 하지 않는 것

- E2E 확장
- `isolated` 모드 도입
- 별도 evaluator agent 도입
- 무거운 harness infra 추가

위 항목들은 위 단계들이 먼저 정리된 뒤 다시 검토한다.

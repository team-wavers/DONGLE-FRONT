# Eval Roadmap

현재 평가 체계의 진행 상태와 보류 항목을 정리한다.

## 기본 명령

- 기본 진입 명령은 `pnpm verify:fast`
- `pnpm verify:docs`는 문서 계약 점검용 하위 명령
- `pnpm test`는 기본 테스트만 보고 싶을 때 쓰는 하위 명령
- E2E 계열 명령은 기본 경로가 아닌 선택 명령

## 완료

- 기본 검증 경로를 `type -> test`로 정리
- 기본 테스트 러너를 `Vitest`로 전환
- 문서 계약 검증을 `verify:docs`로 자동화
- admin/client/rich-text/e2e-fixtures를 workspace project로 분리
- 아래 로직을 기본 테스트로 이동
  - club management 검색 필터
  - club form validation
  - user form validation
  - report 입력 검증
  - report 수정 payload 조합
  - client 검색 필터와 요약 문구
  - register URL 변환
  - fixture path parsing
  - rich text normalization
  - date formatter
- 일부 E2E를 정리하고 단순 렌더링 케이스 제거

## 진행 중

- 남은 helper / payload transform / validation 로직을 계속 `test`로 이동
- 공백 문서와 인벤토리 문서의 갱신 누락을 줄이는 운영 습관 정착

## 보류

- `isolated` 모드 추가
- E2E 재구성
- stateful mock 확장
- rubric 기반 평가 계층 추가

## 판단 기준

### `isolated` 모드

- 현재는 보류한다.
- 이유는 E2E가 기본 검증 경로가 아니기 때문이다.
- E2E 재도입 필요가 커질 때 다시 검토한다.

### Multi-agent evaluator

- 현재는 도입하지 않는다.
- 지금 레포의 병목은 평가자 agent 부재보다, 순수 로직 테스트 자산 부족에 가깝다.
- 따라서 planner / evaluator 구조보다 success criteria와 code-graded test 확장이 우선이다.

### 문서 계약 자동화 확장

- 현재는 필수 문서 존재, 링크 존재, 기본 명령 일관성 정도만 확인한다.
- 내용의 적절성까지 기계적으로 강제하는 단계는 아직 보류한다.
- 문서 검증은 운영 계약을 보호하는 최소 수준에서 유지한다.

## 다음 작업 순서

1. 남아 있는 action helper와 payload transform을 `test`로 옮긴다.
2. 테스트 공백을 `known-gaps.md` 기준으로 줄인다.
3. E2E는 현 상태를 유지하되, 재도입 전까지 크게 확장하지 않는다.

## E2E 승격 기록 규칙

- 새 E2E를 추가하거나 기존 `test` 범위를 E2E로 올리려면 이 문서에 근거를 남긴다.
- 근거 없이 E2E를 늘리지 않는다.
- 근거에는 아래 중 어떤 이유인지 포함한다.
  - 실제 인증 연결 검증
  - 실제 라우팅 연결 검증
  - 실제 제출 후 반영 검증
  - 브라우저와 서버가 같이 있어야만 드러나는 회귀

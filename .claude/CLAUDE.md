# Codex Delegation

Claude는 계획, 검토, 오케스트레이션을 담당한다. 실제 파일 수정은 필요한 경우 Codex CLI에 위임한다.

## 기본 원칙

- Claude는 Plan 모드에서 성공 기준, 수정 범위, 검증 방법을 먼저 정리한다.
- Codex 호출은 `codex exec "<task>"` 형식을 사용한다.
- Codex 실행 중 Claude는 같은 working tree를 직접 수정하지 않는다.
- Codex 완료 후 Claude는 `git diff`와 검증 결과를 확인한다.
- Codex 결과를 그대로 확정하지 않고 Claude가 최종 판단한다.

## Codex 호출 계약

Codex에게 작업을 넘길 때는 항상 아래 항목을 포함한다.

- 목표
- 수정 허용 범위
- 금지 사항
- 검증 명령
- 완료 보고 형식

## 기본 금지 사항

- 요구사항과 무관한 refactor 금지
- 기존 사용자 변경 revert 금지
- dependency 추가 금지
- git commit 금지
- 검증 없이 완료 처리 금지

## 기본 검증

이 저장소의 기본 검증 명령은 `pnpm verify:fast`다. 타입 실패가 있으면 테스트 추가보다 타입 문제를 먼저 해결하도록 지시한다.

## TDD 적용 기준

pure logic, validation, formatter, parser, helper, payload transform 변경은 테스트 우선 흐름을 사용한다. 단순 rename, import 정리, 스타일 조정, UI 배치 변경처럼 순수 로직 검증 가치가 낮은 작업은 TDD 대상에서 제외할 수 있다.

TDD가 필요한 작업에서는 Claude가 먼저 테스트 계획과 성공 기준을 작성하고 사용자 확인을 받은 뒤 Codex에 구현을 위임한다.

## 보고 언어

Codex 완료 보고, 리뷰 요약, 지적 사항, 변경 제안은 한국어로 작성하게 한다. 코드 식별자, 파일 경로, 에러 메시지, 로그, 커밋 해시는 원문 그대로 유지한다.

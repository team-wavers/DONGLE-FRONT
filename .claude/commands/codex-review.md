# Codex 리뷰 위임

다음 범위를 Codex CLI에 리뷰 작업으로 위임한다.

리뷰 범위:

```
$ARGUMENTS
```

Codex에게 전달할 계약:

```text
다음 범위를 코드리뷰해줘.

리뷰 범위:
$ARGUMENTS

역할:
- 너는 독립 리뷰어다.
- 파일을 수정하지 않는다.
- 현재 git diff와 관련 파일 맥락을 기준으로 검토한다.

우선순위:
1. 런타임 에러
2. API 계약 위반
3. 회귀 위험
4. validation / payload transform 문제
5. 테스트 공백

출력 형식:
- Findings first
- 심각도 순서
- 각 항목은 file path, line, rationale, suggested fix를 포함
- 문제가 없으면 명확히 "발견된 문제 없음"이라고 작성
- 남은 테스트 공백이나 잔여 리스크가 있으면 마지막에 1줄로 작성

보고는 한국어로 작성한다. 코드 식별자, 파일 경로, 에러 메시지, 로그는 원문 그대로 유지한다.
```

실행:

```bash
codex exec "<위 계약과 리뷰 범위를 포함한 프롬프트>"
```

Codex 리뷰 결과는 최종 판단이 아니라 검토 입력으로 사용한다. Claude가 findings의 타당성을 확인한 뒤 사용자에게 보고한다.

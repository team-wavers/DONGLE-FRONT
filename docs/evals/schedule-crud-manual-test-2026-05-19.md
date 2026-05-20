# Schedule CRUD Manual Test - 2026-05-19

## 범위

- 브라우저: `cmux browser --surface surface:1`
- 회장 계정: `don / don`
- 관리자 계정: `dongleadmin / dongleadmin`
- 회장 동아리: `스파이크`, `clubId=2`
- 테스트 일정: `CMUX 일정 CRUD 20260519-002647`

## 결과

- 회장 `/2/schedule`에서 일정 등록 성공.
- 회장 `/2/schedule`에서 일정 수정 성공.
  - 제목: `CMUX 일정 CRUD 20260519-002647 수정`
  - 일시: `2026.06.16 20:00 - 2026.06.16 22:00`
  - 공개 상태: `비공개`
- 회장 필터 확인 성공.
  - `공개` 필터에서는 미노출
  - `비공개` 필터에서는 노출
- 관리자 `/admin/schedule`의 2026년 6월 캘린더와 월간 목록에 수정 결과 반영 확인.
- 사용자 `/clubs/2`에는 비공개 전환 후 테스트 일정이 노출되지 않음.
- 회장 `/2/schedule`에서 일정 삭제 성공.
- 관리자 `/admin/schedule`에서도 삭제 반영 확인.
- 테스트 종료 시 테스트 일정이 남아 있지 않음.

## 발견 및 조치

- 수정 중 서버에서 `Cannot read properties of null (reading 'trim')` 오류가 발생했다.
- 원인: 프론트 수정 payload가 optional 문자열 필드에 `null`을 보내고, 서버 update 로직이 `.trim()`을 호출함.
- 조치: 일정 payload builder에서 optional 문자열을 `null` 대신 trim된 문자열 또는 `""`로 보내도록 수정.
- 검증: `pnpm verify:fast` 통과.

## 남은 리스크

- 일정 생성/수정의 클라이언트 및 action 검증은 날짜 순서, 길이 제한 등을 아직 서버 400에 의존한다.

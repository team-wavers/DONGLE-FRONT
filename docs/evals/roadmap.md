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
- stateful mock 확장
- rubric 기반 평가 계층 추가

## 개발 배포 후 E2E

Vercel의 `dev` ADMIN과 Lightsail의 `develop` API가 실제 dev DB를 사용하도록 구성한다. MSW 기반 CLIENT 스모크와 `verify:fast`는 기존 CI에서 유지한다. 개발 배포 후 E2E는 브라우저 로그인, 세션 쿠키, 실제 API·DB 연결과 권한을 함께 확인한다.

| 순서 | 담당 | 작업 | 완료 기준 |
| --- | --- | --- | --- |
| 1 | Vercel·서버 설정 | `dev` ADMIN 프로젝트와 URL, dev API URL 확인. ADMIN의 `API_URL`과 `JWT_SECRET` 설정 및 HTTPS 쿠키 확인. | 기대한 dev 배포가 접속 가능하고 ADMIN의 JWT 검증 키가 dev API의 액세스 토큰 서명 키와 일치한다. 배포 보호가 켜져 있으면 러너가 해당 dev 호스트에서만 자동화용 시크릿을 사용한다. |
| 2 | 서버 | dev 전용 시드 명령으로 관리자·회장 각 1명과 동아리 A·B를 만든다. A의 회장만 테스트 계정에 연결한다. | 시드를 연속 두 번 실행해도 데이터가 중복되지 않는다. dev DB 복원·민감정보 정리·마이그레이션 후에도 같은 계정으로 로그인할 수 있다. 숫자 ID는 해당 DB에서 확인한다. |
| 3 | 프런트·서버 | 프런트에 배포 URL을 사용하는 Playwright 모드를 두고, 관리자·회장 로그인과 보호된 API 계약을 한 실행에서 검증한다. | 관리자 목록에 시드 회장이 보인다. 회장은 A를 조회할 수 있고 B 관리 화면과 보호된 B 일정 API는 거부된다. 서버 응답의 인증 비밀 미포함도 확인한다. |
| 4 | GitHub Actions | Vercel의 `vercel.deployment.success` 이벤트 중 ADMIN `dev` 배포를 선택한다. 서버 `develop` 외부 헬스체크 성공 후에도 같은 프런트 워크플로를 호출한다. 수동 실행도 지원한다. | 각 저장소 배포 후 자동 실행되고 다른 브랜치나 CLIENT 배포 이벤트는 제외된다. 실패한 검사도 배포 이력과 함께 추적하고 재실행할 수 있다. |
| 5 | 테스트 운영 | 전용 데이터로 동아리 수정·보고서 작성/삭제를 추가한다. 업로드는 개발 스토리지 격리를 확인한 뒤 추가한다. | 성공·중간 실패 시 원복 또는 삭제가 검증된다. 강제 취소 후에도 실행 ID가 있는 테스트 데이터만 정리되며 일반 개발 데이터와 운영 자원은 건드리지 않는다. |

- 서버의 기존 헬스체크는 HTTP 응답만 확인한다. Playwright 실행 전 허용된 dev 호스트와 배포 버전, 시드 준비 상태를 확인한다. 실패 시 환경 준비 문제와 로그인·권한 동작 실패를 구분할 수 있게 결과를 남긴다.
- 테스트 계정의 refresh token을 공유하므로 실행은 한 번에 하나로 제한한다. 각 역할은 한 번 로그인하고 브라우저 세션을 재사용한다. 결과에는 프런트·서버 배포 SHA와 실패 위치를 남기고 세션 파일이나 자격 증명이 포함된 아티팩트는 올리지 않는다.
- 자동 실행은 개발 배포 후 검사로 시작한다. 수동 실행으로 정상 흐름과 권한 거부 assertion이 실제로 실패를 감지하는지 확인한 다음 두 배포 이벤트를 연결한다.
- Vercel 이벤트 형식과 기본 브랜치 조건은 [Vercel GitHub 연동 문서](https://vercel.com/docs/git/vercel-for-github)를 따른다.

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
3. 개발 배포 후 E2E는 위 표의 순서대로 도입한다.

## E2E 승격 기록 규칙

- 새 E2E를 추가하거나 기존 `test` 범위를 E2E로 올리려면 이 문서에 근거를 남긴다.
- 근거 없이 E2E를 늘리지 않는다.
- 근거에는 아래 중 어떤 이유인지 포함한다.
  - 실제 인증 연결 검증
  - 실제 라우팅 연결 검증
  - 실제 제출 후 반영 검증
  - 브라우저와 서버가 같이 있어야만 드러나는 회귀

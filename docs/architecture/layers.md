# 레이어 책임과 오류 처리 규약

이 문서는 `DONGLE-FRONT`에서 API 호출부터 UI까지 각 레이어의 책임을 정리하고, 특히 `isSuccess` 기반 분기와 “진짜 throw”의 기본값을 통일하기 위한 규약을 정의한다.

## 용어

- **구조화 응답(Structured Response)**: 백엔드가 전역 인터셉터로 통일해 내려주는 JSON 형태.
  - 성공: `{ isSuccess: true, result: T }`
  - 실패: `{ isSuccess: false, error: { message: string, detail: string } }`
- **진짜 throw(Transport/Runtime Error)**: HTTP 상태코드 실패가 아니라, 요청 수행 자체가 깨질 때 발생하는 예외.
  - 예: `fetch` reject(네트워크/런타임), 서버 런타임 컨텍스트 오류 등

## 1) `@dongle/api` (transport 레이어)

대상: `packages/api` (`FetchInstance`, `makeRequest` 등)

- **책임**
  - HTTP 요청을 수행하고, 가능한 경우 **서버 JSON 바디를 그대로 반환**한다.
  - HTTP 상태코드(4xx/5xx)에 대한 도메인 정책을 갖지 않는다.
- **오류 처리 기본값**
  - **HTTP 4xx/5xx는 throw하지 않는다.** 서버가 내려준 JSON 바디를 그대로 반환한다.
  - **JSON 파싱 불가(HTML 등) 응답은 synthetic `{ isSuccess:false }`로 정규화**해 반환한다.
- **남는 throw**
  - `fetch` reject(네트워크/런타임) 같은 **진짜 throw**는 기본적으로 상위로 전파될 수 있다.

## 2) `@dongle/service` (도메인 서비스 레이어)

대상: `packages/service`

- **책임**
  - 엔드포인트 경로/쿼리 조합, `FetchOptions`(캐시/태그/`no-store`) 결정
  - `Response<T>`를 **그대로 반환**한다. (기본값)
  - `result` 추출/실패 처리 같은 정책은 서비스 밖(서버 오케스트레이션)으로 올린다.
- **금지(기본값)**
  - HTTP 실패를 예외로 가정한 `try/catch` + 메시지 문자열 매칭 기반 정규화
  - “HTTP 실패는 throw, 동시에 `if (!res.isSuccess)` 분기”처럼 한 호출 경로에 두 계약을 혼용
- **원칙**
  - 진짜 throw(네트워크/런타임)를 `Response<T>`로 정규화해야 하는 경우에도, 기본은 서비스가 아니라 **서버 오케스트레이션 레이어**에서 수행한다.

## 3) 서버 오케스트레이션 레이어 (RSC + Server Action)

대상: Next.js **서버 컴포넌트(RSC)**와 `"use server"` **Server Action**

> 기술적으로 Server Action과 RSC는 다르지만, **역할 관점(서버에서 조립/정책 결정)**에서는 같은 계층으로 본다.

- **책임**
  - 화면/플로우 단위로 서비스 호출 결과를 조립한다.
  - `if (!res.isSuccess)` 분기를 통해 **UI 정책을 결정**한다.
    - 예: not-found 여부 판단, 사용자 메시지 매핑, fallback/리다이렉트, 캐시 무효화 등
- **오류 처리 기본값**
  - 구조화 실패(`isSuccess:false`)는 throw로 바꾸지 말고, 이 레이어에서 정책적으로 처리한다.
  - 진짜 throw(네트워크/런타임)는 기본적으로 error boundary로 전파된다.
  - 단, UI를 깨면 안 되는 경로라면 이 레이어에서 잡아 **구조화된 실패**로 바꾼다.

## 4) UI 레이어 (클라이언트 컴포넌트/페이지)

- **책임**
  - 표시/상태/사용자 상호작용
  - 서버 오케스트레이션이 제공한 결과(구조화 결과 또는 표준 액션 결과)를 렌더링
- **오류 처리 기본값**
  - 가능하면 `try/catch`보다 `isSuccess` 분기로 UI 상태를 나누는 방식을 우선한다.

## 체크리스트

- `Response<T>`를 다루는 코드에서 실패 분기가 실제로 도달 가능한가?
- HTTP 실패를 예외로 가정한 문자열 매칭 정규화가 남아있지 않은가?
- 진짜 throw(네트워크/런타임)를 “반드시 구조화해야 하는 경로”가 어디인지 분리돼 있는가?


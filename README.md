# DONGLE-FRONT

동글 서비스 프론트엔드 모노레포입니다.  
사용자용 클라이언트 앱과 운영용 관리자 앱을 함께 관리합니다.

## 프로젝트 개요

- 사용자 앱은 동아리 목록, 동아리 상세, 활동보고서 조회 기능을 제공합니다.
- 관리자 앱은 동아리 관리, 동아리 등록 URL 발급, 사용자 관리, 배너 관리 기능을 제공합니다.
- 회장 계정은 동아리 정보 수정, 계정 정보 관리, 활동보고서 작성/수정 기능을 사용합니다.

기술 스택:

- `Next.js`
- `React`
- `Turborepo`
- `pnpm workspace`
- `Tailwind CSS`

## 구조

```txt
apps/
  DONGLE-ADMIN   관리자/회장 앱
  DONGLE-CLIENT  사용자 앱

packages/
  api            공용 API 유틸
  service        공용 서비스 계층
  types          공용 타입
  ui             공용 UI 컴포넌트
  rich-text      공용 리치텍스트 뷰어
```

## 실행

```bash
pnpm install
pnpm dev
```

개별 실행:

```bash
pnpm dev:client
pnpm dev:admin
```

기본 포트:

- Client: `http://localhost:4000`
- Admin: `http://localhost:4001`

## 주요 스크립트

```bash
pnpm dev
pnpm build
pnpm type
pnpm test:e2e
```

## 환경 변수 원칙

이 프로젝트는 아티팩트 중심 배포 전략을 기준으로 환경 변수를 관리합니다.

- 서버에서만 필요한 값은 `NEXT_PUBLIC_`를 붙이지 않습니다.
- 클라이언트가 직접 몰라도 되는 값은 서버에서 읽고, 클라이언트는 서버를 경유합니다.
- `NEXT_PUBLIC_*`는 클라이언트 번들에 꼭 필요한 값만 최소한으로 유지합니다.

현재 기준:

- 서버 전용 env: `API_URL`
- 클라이언트 공개 env: `NEXT_PUBLIC_S3_URL`

즉 서버 주소 계열 값은 서버 런타임 env로 관리하고, 공개 호스트만 최소한으로 클라이언트에 노출합니다.

## 테스트

E2E는 `Playwright`를 사용합니다.

- 위치: `e2e/`
- 대상:
  - `admin`
  - `club`
  - `client`

로컬에서 브라우저가 없으면 한 번 설치가 필요합니다.

```bash
pnpm exec playwright install chromium
```

## 개발 메모

- 관리자/사용자 앱 모두 `standalone` 출력 설정을 사용합니다.
- 관리자 활동보고서 작성은 `Tiptap` 기반 에디터를 사용합니다.
- 리치 텍스트 읽기 렌더링은 `packages/rich-text` 공용 viewer를 사용합니다.

## 제품 기획

- 압축된 제품 기획 문서는 [docs/product](docs/product/README.md)에 정리합니다.

## 검증

```bash
pnpm --filter dongle-admin type
pnpm --filter dongle-client type
```

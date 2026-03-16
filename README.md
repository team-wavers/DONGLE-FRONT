# DONGLE-FRONT

동글 서비스 프론트엔드 모노레포입니다.  
`Next.js + Turborepo + pnpm workspace` 기반으로 관리자 앱과 사용자 앱을 함께 관리합니다.

## 구조

```txt
apps/
  DONGLE-ADMIN   관리자 앱
  DONGLE-CLIENT  사용자 앱

packages/
  api            공용 API 유틸
  service        공용 서비스 계층
  types          공용 타입
  ui             공용 UI 컴포넌트
  rich-text      공용 리치텍스트 뷰어
```

## 실행

루트 기준:

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
pnpm dev:client
pnpm dev:admin
pnpm build
pnpm type
pnpm test:e2e
pnpm test:e2e:client
pnpm test:e2e:admin
```

## E2E 테스트

`Playwright`를 사용합니다.

- 설정 파일: [playwright.config.ts](/Users/bigsheep/Desktop/projects/DONGLE-FRONT/playwright.config.ts)
- 테스트 위치:
  - `e2e/client`
  - `e2e/admin`

현재는 admin/client 스모크 테스트부터 시작하는 구조입니다.

브라우저가 없으면 한 번 설치가 필요합니다.

```bash
pnpm exec playwright install chromium
```

## 환경 변수 원칙

이 프로젝트는 아티팩트 중심 배포 전략을 기준으로 환경 변수를 관리합니다.

원칙:

- 서버에서만 필요한 값은 `NEXT_PUBLIC_`를 붙이지 않습니다.
- 클라이언트에서 직접 읽지 않아도 되는 값은 모두 서버에서 읽습니다.
- `NEXT_PUBLIC_*`는 정말 클라이언트 번들에 포함되어야 하는 값만 최소한으로 유지합니다.

### 서버 전용 환경 변수

예:

- `API_URL`

이 값은 서버 코드에서만 읽습니다.

- route handler
- server action
- server component
- 공용 서버 서비스 계층

즉, 클라이언트 번들에는 포함되지 않습니다.

### 클라이언트 공개 환경 변수

예:

- `NEXT_PUBLIC_S3_URL`

이 값은 현재 `next.config.ts`의 이미지 허용 도메인 설정에 사용합니다.  
이 값은 빌드 시점에 반영되므로, 환경마다 달라지면 아티팩트 승격 전략에 불리합니다.

현재 전제:

- `S3 URL`은 환경 간 공통
- 나머지 서버 주소 계열 값은 런타임 서버 env로 관리

## 현재 적용된 env 정책

다음 값은 서버 런타임 env로 전환했습니다.

- `NEXT_PUBLIC_API_URL` -> `API_URL`

다음 값은 env 사용을 제거했습니다.

- `NEXT_PUBLIC_ADMIN_URL`
  - 현재 브라우저 origin 기준으로 URL을 생성합니다.

즉 현재 기준으로는:

- 서버 주소: 서버 env
- 관리자 현재 도메인: 브라우저 origin 사용
- S3 공개 호스트: `NEXT_PUBLIC_S3_URL` 유지

## 아티팩트 전략

이 프로젝트는 가능하면 같은 빌드 산출물을 환경 간 승격하는 방향을 지향합니다.

권장 원칙:

1. 서버 주소, 인증 주소, 업로드 주소는 서버가 env를 읽습니다.
2. 클라이언트는 직접 환경 변수를 읽지 않고 Next 서버를 경유합니다.
3. `next.config.ts`에 들어가는 공개 호스트 값은 가능하면 환경 간 동일하게 유지합니다.

## 개발 메모

- 관리자/사용자 앱 모두 `standalone` 출력 설정을 사용합니다.
- 리치 텍스트 작성은 관리자 앱에서 `Tiptap` 기반 에디터를 사용합니다.
- 리치 텍스트 읽기 렌더링은 `packages/rich-text`의 공용 viewer를 사용합니다.

## 검증

타입 체크:

```bash
pnpm --filter dongle-admin type
pnpm --filter dongle-client type
```

전체:

```bash
pnpm type
```

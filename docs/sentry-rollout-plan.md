# Sentry Rollout Plan

동글 프론트 레포의 Sentry 적용은 `DONGLE-CLIENT`, `DONGLE-ADMIN` 두 Next.js 앱을 우선 대상으로 하고, 초기 범위는 `prod`만 설정합니다. 환경값 관리는 서버 파일이 아니라 GitHub Secrets를 원본으로 사용하는 것을 기준으로 합니다.

## 목표

- 운영 환경의 클라이언트 에러를 빠르게 수집
- Next.js 서버 렌더링 중 발생하는 예외를 함께 추적
- 배포 버전별 이슈 발생 시점을 확인
- `prod` 배포 기준으로 release를 추적

## 적용 순서

1. `DONGLE-CLIENT` 적용
2. `DONGLE-ADMIN` 적용
3. 운영 배포 파이프라인과 release 연결
4. 필요 시 `Nest` API 서버 적용

## 권장 Sentry 프로젝트 구성

- `dongle-client`
- `dongle-admin`
- `dongle-api`

초기에는 `production`만 사용합니다.

## 1단계: Next.js 앱 적용 범위

우선 적용 대상:

- `apps/DONGLE-CLIENT`
- `apps/DONGLE-ADMIN`

수집 대상:

- 브라우저 런타임 예외
- App Router 기준 서버 렌더링 예외
- API route 예외
- 배포 release 정보
- 사용자 식별자 수준의 최소 context

초기에는 성능 추적과 세션 리플레이를 과하게 켜지 않는 것을 권장합니다.

## 구현 포인트

각 앱에 Sentry SDK를 설치하고 아래 파일 구성을 맞춥니다.

- `sentry.client.config.*`
- `sentry.server.config.*`
- `sentry.edge.config.*` 필요 시
- `instrumentation.ts` 또는 Next.js 공식 초기화 흐름에 맞는 진입 파일

Next.js 15 + App Router 기준으로는 공식 설치 가이드에 맞춰 앱별 초기화 파일을 분리하는 방식을 권장합니다.

### DONGLE-CLIENT

우선 검토할 파일:

- `apps/DONGLE-CLIENT/src/app/layout.tsx`
- `apps/DONGLE-CLIENT/src/app/error.tsx`
- `apps/DONGLE-CLIENT/src/app/global-error.tsx`

추가될 가능성이 높은 파일:

- `apps/DONGLE-CLIENT/instrumentation.ts`
- `apps/DONGLE-CLIENT/sentry.client.config.ts`
- `apps/DONGLE-CLIENT/sentry.server.config.ts`

### DONGLE-ADMIN

우선 검토할 파일:

- `apps/DONGLE-ADMIN/src/app/layout.tsx`
- `apps/DONGLE-ADMIN/src/app/global-error.tsx`
- `apps/DONGLE-ADMIN/src/app/(대시보드)/error.tsx`

추가될 가능성이 높은 파일:

- `apps/DONGLE-ADMIN/instrumentation.ts`
- `apps/DONGLE-ADMIN/sentry.client.config.ts`
- `apps/DONGLE-ADMIN/sentry.server.config.ts`

### 공통 적용 포인트

- App Router 전역 에러 바운더리에서 Sentry capture
- 서버 렌더링/route handler 예외 수집
- 로그인 사용자 ID 정도만 context에 추가
- 토큰, 쿠키, Authorization header는 마스킹

## 필요한 환경변수와 GitHub Secrets

공개 DSN:

- `NEXT_PUBLIC_SENTRY_DSN`
  - 브라우저에서 에러를 전송할 때 사용
  - Sentry 프로젝트의 Client Key(DSN)

서버/배포 연동용:

- `SENTRY_AUTH_TOKEN`
  - 소스맵 업로드 자동화 시 사용
- `SENTRY_ORG`
  - Sentry organization slug
- `SENTRY_PROJECT`
  - 앱별 project slug
- `SENTRY_ENVIRONMENT`
  - 초기값은 `production`
- `SENTRY_RELEASE`
  - 배포 버전 식별자
  - GitHub Actions에서는 보통 `github.sha` 사용

앱별로 project가 다르면 `SENTRY_PROJECT`는 앱마다 따로 관리합니다.

초기에는 `prod`만 세팅하므로 GitHub Secrets 기준으로 아래처럼 두는 것을 권장합니다.

### client용 GitHub Secrets

- `CLIENT_NEXT_PUBLIC_SENTRY_DSN`
- `CLIENT_SENTRY_AUTH_TOKEN`
- `CLIENT_SENTRY_ORG`
- `CLIENT_SENTRY_PROJECT`

### admin용 GitHub Secrets

- `ADMIN_NEXT_PUBLIC_SENTRY_DSN`
- `ADMIN_SENTRY_AUTH_TOKEN`
- `ADMIN_SENTRY_ORG`
- `ADMIN_SENTRY_PROJECT`

### 공통 값

- `SENTRY_ENVIRONMENT=production`
- `SENTRY_RELEASE=$GITHUB_SHA`

즉 배포 워크플로우에서는 GitHub Secrets를 읽어 앱별 빌드 환경변수로 주입하고, 서버 런타임에도 같은 release/environment 값을 넘기는 흐름을 권장합니다.

## Release 전략

release는 배포 단위와 1:1로 대응되게 잡는 것이 좋습니다.

권장 값:

- GitHub Actions: `${{ github.sha }}`

이 값을 기준으로:

- 어떤 배포부터 에러가 발생했는지 확인
- sourcemap과 연결
- 회귀 시점 추적

## 배포 파이프라인 연동

### main PR CI

`main` PR CI에서는 Sentry 연동이 필수는 아닙니다.

역할:

- `install`
- `type`
- `build`

여기서는 Sentry 업로드 없이 빌드 통과 여부만 확인해도 충분합니다.

### prod 배포

Lightsail 배포 워크플로우에서 아래를 추가하는 방식이 적합합니다.

- `SENTRY_RELEASE=$GITHUB_SHA`
- prod build 시 sourcemap 업로드
- 배포 후 운영 에러를 release 기준으로 추적

## 사용자 정보와 개인정보 처리

초기에는 아래 정도만 붙이는 것을 권장합니다.

- 로그인 사용자 ID
- role
- 현재 경로

수집하면 안 되는 값:

- access token
- refresh token
- cookie 원문
- form 입력 전문
- Authorization header

민감 정보는 `beforeSend` 같은 필터에서 제거하는 방향이 안전합니다.

## 알림 정책

초기 추천:

- `production`만 Slack 또는 이메일 알림

알림은 다음 수준부터 시작하는 것이 무난합니다.

- unhandled exception
- 동일 에러가 짧은 시간 안에 반복 발생

## 검증 절차

1. 각 앱에 SDK 설치
2. 테스트 에러 발생
3. Sentry 대시보드 수집 확인
4. 운영 배포 후 release 연결 확인
5. 소스맵 기준 스택트레이스 복원 확인

## 2단계: Nest API 적용

Next.js 앱 안정화 후에는 API 서버도 같은 방식으로 확장할 수 있습니다.

적용 대상:

- controller 예외
- service 예외
- global exception filter
- background task 또는 cron 성격의 작업

Nest까지 붙이면 프론트와 API 에러를 함께 추적할 수 있어 원인 파악 속도가 빨라집니다.

## 추천 실행 순서

1. `DONGLE-CLIENT`에 Sentry 추가
2. `DONGLE-ADMIN`에 동일 패턴 적용
3. `main` 머지 후 prod release 연동
4. 필요 시 Nest API 확장

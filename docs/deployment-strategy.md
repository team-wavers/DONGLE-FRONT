# Deployment Strategy

이 문서는 운영 배포 경로와 롤백 전략을 정리한다.

## 개요

- 운영 배포 대상은 `dongle-client`, `dongle-admin` 두 Next.js standalone 앱이다.
- GitHub Actions가 `main` 반영 후 Lightsail 서버로 standalone 산출물을 전송한다.
- 프로세스 관리는 PM2가 담당한다.

## 배포 흐름

1. `Main PR CI`가 PR에서 `pnpm verify:fast`, `pnpm build`를 검증한다.
2. `main`에 merge되면 `prod-lightsail-deploy.yml`이 실행된다.
3. 배포 workflow는 다시 `pnpm verify:fast`를 실행한다.
4. client/admin standalone 산출물을 각각 `releases/<git-sha>/client`, `releases/<git-sha>/admin`에 업로드한다.
5. 운영 symlink인 `current.client`, `current.admin`을 새 릴리스로 전환한다.
6. PM2가 `current.*` 경로의 `server.js`를 reload 한다.
7. 내부 healthcheck와 선택적 외부 healthcheck를 통과하면 배포를 확정한다.

## 디렉터리 구조

- 루트: `/home/ec2-user/dongle.front.prod`
- 릴리스 저장소: `/home/ec2-user/dongle.front.prod/releases/<git-sha>`
- 현재 운영 client symlink: `/home/ec2-user/dongle.front.prod/current.client`
- 현재 운영 admin symlink: `/home/ec2-user/dongle.front.prod/current.admin`

PM2는 운영에서 직접 릴리스 디렉터리를 보지 않고 `current.client`, `current.admin` symlink를 따라간다.

## Healthcheck

두 앱 모두 내부 health route를 제공한다.

- client: `GET /api/health`
- admin: `GET /api/health`

응답은 다음 정보를 포함한다.

- `ok`
- `app`
- `environment`
- `release`

운영 배포 workflow는 서버 내부에서 다음 검증을 수행한다.

- `http://127.0.0.1:3000/api/health`
- `http://127.0.0.1:4000/api/health`

각 health 응답의 `release`는 현재 배포 중인 Git SHA와 일치해야 한다.

선택적으로 공개 URL healthcheck를 추가할 수 있다.

- `PROD_CLIENT_HEALTHCHECK_URL`
- `PROD_ADMIN_HEALTHCHECK_URL`

## 롤백 전략

헬스체크 실패 시 workflow는 자동으로 이전 릴리스로 복구한다.

1. symlink 전환 전 기존 `current.client`, `current.admin` 대상 경로를 저장한다.
2. 새 릴리스로 symlink를 바꾸고 PM2 reload를 시도한다.
3. healthcheck가 실패하면 symlink를 이전 경로로 되돌린다.
4. PM2를 다시 reload 한다.
5. workflow는 실패 상태로 종료한다.

이 방식은 배포 대상 디렉터리를 직접 덮어쓰는 방식보다 복구 시간이 짧고, 이전 산출물을 보존할 수 있다.

## 필수 시크릿

- `PROD_API_URL`
- `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`
- `LIGHTSAIL_HOST`
- `LIGHTSAIL_SSH_KEY`
- `CLIENT_NEXT_PUBLIC_SENTRY_DSN`
- `ADMIN_NEXT_PUBLIC_SENTRY_DSN`

## 선택 시크릿

- `PROD_CLIENT_HEALTHCHECK_URL`
- `PROD_ADMIN_HEALTHCHECK_URL`
- Sentry sourcemap 업로드용 org/project/token 값

## 환경변수 정리

### GitHub Actions Secrets

운영 자동 배포 workflow는 다음 GitHub secrets를 읽는다.

등록할 secret 목록은 루트의 [.env.github-secrets.prod.example](../.env.github-secrets.prod.example)에 예시로 정리한다.

필수 secret:

- `PROD_API_URL`
  - client/admin 서버 런타임에서 사용하는 백엔드 API base URL
- `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`
  - Next Server Actions 암호화 키
- `LIGHTSAIL_HOST`
  - 운영 Lightsail SSH 접속 호스트
- `LIGHTSAIL_SSH_KEY`
  - 운영 서버 배포용 PEM 키 내용
- `CLIENT_NEXT_PUBLIC_SENTRY_DSN`
  - client 브라우저 Sentry DSN
- `ADMIN_NEXT_PUBLIC_SENTRY_DSN`
  - admin 브라우저 Sentry DSN

Sentry sourcemap 업로드용 secret:

- `CLIENT_SENTRY_AUTH_TOKEN`
  - client sourcemap 업로드용 Sentry auth token
- `CLIENT_SENTRY_ORG`
  - client Sentry org
- `CLIENT_SENTRY_PROJECT`
  - client Sentry project
- `ADMIN_SENTRY_AUTH_TOKEN`
  - admin sourcemap 업로드용 Sentry auth token
- `ADMIN_SENTRY_ORG`
  - admin Sentry org
- `ADMIN_SENTRY_PROJECT`
  - admin Sentry project

선택 secret:

- `PROD_CLIENT_HEALTHCHECK_URL`
  - client 외부 healthcheck URL. 예: `https://dongle.wavers.kr/api/health`
- `PROD_ADMIN_HEALTHCHECK_URL`
  - admin 외부 healthcheck URL. 예: `https://admin.dongle.wavers.kr/api/health`

### PM2 런타임 env

배포 workflow는 GitHub Secrets 값을 서버 런타임에서 읽을 수 있도록 `$ROOT_DIR/.env.pm2.prod` 파일로 매 배포마다 다시 쓴다.
이 파일은 직접 관리하는 설정 원본이 아니라 PM2 실행용 산출물이다.

주요 항목:

- `API_URL`
  - PM2로 실행되는 client/admin 서버가 호출할 백엔드 API base URL
- `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`
  - standalone 서버에서 Server Action payload를 복호화할 때 쓰는 키
- `SENTRY_ENVIRONMENT`
  - Sentry 이벤트에 붙는 환경 이름. 운영 배포에서는 `production`
- `SENTRY_RELEASE`
  - Sentry 이벤트와 healthcheck가 공유하는 릴리스 id. 운영 배포에서는 Git SHA
- `CLIENT_NEXT_PUBLIC_SENTRY_DSN`
  - client 브라우저 번들에 노출되는 Sentry DSN
- `ADMIN_NEXT_PUBLIC_SENTRY_DSN`
  - admin 브라우저 번들에 노출되는 Sentry DSN
- `DEPLOY_CLIENT_DIR_PROD`
  - PM2가 client standalone `server.js`를 찾을 운영 symlink 경로
- `DEPLOY_ADMIN_DIR_PROD`
  - PM2가 admin standalone `server.js`를 찾을 운영 symlink 경로

client/admin 모두 같은 Git SHA를 배포하므로 앱별 `*_SENTRY_ENVIRONMENT`, `*_SENTRY_RELEASE`는 별도로 만들지 않는다.

### 수동 SCP 배포용 `.env.deploy`

로컬에서 수동 SCP 스크립트를 쓸 때는 루트의 `.env.deploy`를 사용한다.
현재 기본 배포 경로는 dev는 Render, prod는 GitHub Actions이므로 `.env.deploy`는 필수 운영 설정이 아니라 수동 fallback 용도다.

필수 항목:

- `DEPLOY_PEM`
  - 수동 SCP 배포에서 사용할 SSH private key 경로. 기본 키를 쓰면 생략 가능
- `DEPLOY_USER`
  - 수동 SCP 배포 SSH 사용자
- `DEPLOY_HOST`
  - 수동 SCP 배포 대상 호스트
- `DEPLOY_CLIENT_DIR`
  - 수동 SCP로 client standalone 산출물을 업로드할 서버 경로
- `DEPLOY_ADMIN_DIR`
  - 수동 SCP로 admin standalone 산출물을 업로드할 서버 경로

현재 예시는 `.env.deploy.example`에 정리되어 있다.

## 운영 체크리스트

- `main` 브랜치 보호 활성화
- required status check에 `Main PR CI / validate` 지정
- `main` direct push 금지
- 운영 배포 전 PR CI 통과 확인
- 운영 배포 후 healthcheck와 주요 사용자 흐름 수동 점검

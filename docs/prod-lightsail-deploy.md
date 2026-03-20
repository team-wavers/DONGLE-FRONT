# Prod Lightsail Deploy

이 프로젝트의 운영 배포는 `Next standalone + rsync + PM2` 흐름을 사용합니다.

## 대상 경로

- 배포 루트: `/home/ec2-user/dongle.front.prod`
- Client: `/home/ec2-user/dongle.front.prod/dongle.client.prod`
- Admin: `/home/ec2-user/dongle.front.prod/dongle.admin.prod`

각 앱 디렉터리 안에는 `apps/<APP_NAME>/server.js`, `node_modules`, `.next/static`, `public`이 함께 배포됩니다.

## GitHub Actions

워크플로우 파일:

- `.github/workflows/prod-lightsail-deploy.yml`

트리거:

- `main` 브랜치 push
- 수동 실행 `workflow_dispatch`

주요 단계:

1. 의존성 설치
2. 타입 검사
3. `pnpm deploy:standalone:prod`
4. `rsync`로 Lightsail에 업로드
5. `/home/ec2-user/dongle.front.prod/.env.pm2.prod` 생성
6. `PM2_APP_ENV=prod pm2 reload ecosystem.config.js --update-env`

## 필요한 GitHub Secrets

- `LIGHTSAIL_HOST`
- `LIGHTSAIL_SSH_KEY`
- `PROD_API_URL`
- `PROD_CLIENT_HEALTHCHECK_URL` (선택)
- `PROD_ADMIN_HEALTHCHECK_URL` (선택)

각 secret에 들어갈 값은 아래 기준으로 넣습니다.

- `LIGHTSAIL_HOST`
  - Lightsail 서버의 접속 호스트명 또는 공인 IP
  - 예시: `dongle.wavers.kr`
  - 예시: `43.xx.xx.xx`
- `LIGHTSAIL_SSH_KEY`
  - 배포에 사용할 PEM 개인키의 "파일 경로"가 아니라 "파일 내용 전체"
  - 예시:

```text
-----BEGIN RSA PRIVATE KEY-----
...
-----END RSA PRIVATE KEY-----
```

- `PROD_API_URL`
  - 운영 API의 베이스 URL
  - 현재 프로젝트 기준 예시: `https://api.dongle.wavers.kr/v1`
- `PROD_CLIENT_HEALTHCHECK_URL`
  - 배포 후 client 앱이 정상 응답하는지 확인할 URL
  - 별도 health endpoint가 없으면 메인 도메인을 넣어도 됩니다
  - 예시: `https://dongle.wavers.kr`
- `PROD_ADMIN_HEALTHCHECK_URL`
  - 배포 후 admin 앱이 정상 응답하는지 확인할 URL
  - 별도 health endpoint가 없으면 admin 메인 도메인을 넣어도 됩니다
  - 예시: `https://admin.dongle.wavers.kr`

GitHub에서 등록 위치:

1. 레포 이동
2. `Settings`
3. `Secrets and variables`
4. `Actions`
5. `Repository secrets`

현재 구성에서는 `Repository secrets`에 넣는 것을 권장합니다.

## 서버 준비 체크리스트

- Node.js 설치
- `pm2` 설치
- `pm2 startup`
- `pm2 save`
- Nginx reverse proxy 설정
- 80/443 포트 오픈
- SSL 인증서 적용

## 수동 점검 명령어

```bash
pm2 ls
pm2 logs dongle.client.prod --lines 100
pm2 logs dongle.admin.prod --lines 100
curl -I http://127.0.0.1:3000
curl -I http://127.0.0.1:4000
```

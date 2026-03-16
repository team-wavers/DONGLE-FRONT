/**
 * PM2 설정 (서버용) - dev/prod 한 파일에서 환경변수로 선택
 *
 * 사용:
 *   pm2 start ecosystem.config.js              → 개발 (기본)
 *   PM2_APP_ENV=prod pm2 start ecosystem.config.js → 운영
 *
 * cwd = standalone 배포 루트 (node_modules 가 있는 곳). script = 그 안의 apps/앱명/server.js
 * 그래야 Next가 찾는 node_modules 를 올바르게 찾음 (MODULE_NOT_FOUND 방지).
 */

const env = process.env.PM2_APP_ENV || "dev";

// standalone 을 SCP한 루트 (node_modules, apps/ 가 있는 디렉터리)
const clientDevRoot = process.env.DEPLOY_CLIENT_DIR || "/home/ec2-user/dongle.front.dev/dongle.client.dev";
const adminDevRoot = process.env.DEPLOY_ADMIN_DIR || "/home/ec2-user/dongle.front.dev/dongle.admin.dev";
const clientProdRoot = process.env.DEPLOY_CLIENT_DIR_PROD || "/home/ec2-user/dongle.front.prod/dongle.client.prod";
const adminProdRoot = process.env.DEPLOY_ADMIN_DIR_PROD || "/home/ec2-user/dongle.front.prod/dongle.admin.prod";

const commonAppConfig = {
    instances: 1,
    exec_mode: "fork",
    autorestart: true,
    max_restarts: 10,
    min_uptime: "10s",
    restart_delay: 5000,
    kill_timeout: 5000,
    listen_timeout: 10000,
    time: true,
};

const configs = {
    dev: {
        apps: [
            {
                ...commonAppConfig,
                name: "dongle.client.dev",
                cwd: clientDevRoot,
                script: `${clientDevRoot}/apps/DONGLE-CLIENT/server.js`,
                max_memory_restart: "700M",
                env: {
                    NODE_ENV: "development",
                    HOSTNAME: "0.0.0.0",
                    PORT: 3001,
                    NODE_OPTIONS: "--max-old-space-size=768",
                },
            },
            {
                ...commonAppConfig,
                name: "dongle.admin.dev",
                cwd: adminDevRoot,
                script: `${adminDevRoot}/apps/DONGLE-ADMIN/server.js`,
                max_memory_restart: "500M",
                env: {
                    NODE_ENV: "development",
                    HOSTNAME: "0.0.0.0",
                    PORT: 4001,
                    NODE_OPTIONS: "--max-old-space-size=512",
                },
            },
        ],
    },
    prod: {
        apps: [
            {
                ...commonAppConfig,
                name: "dongle.client.prod",
                cwd: clientProdRoot,
                script: `${clientProdRoot}/apps/DONGLE-CLIENT/server.js`,
                max_memory_restart: "700M",
                env: {
                    NODE_ENV: "production",
                    HOSTNAME: "0.0.0.0",
                    PORT: 3000,
                    NODE_OPTIONS: "--max-old-space-size=768",
                },
            },
            {
                ...commonAppConfig,
                name: "dongle.admin.prod",
                cwd: adminProdRoot,
                script: `${adminProdRoot}/apps/DONGLE-ADMIN/server.js`,
                max_memory_restart: "500M",
                env: {
                    NODE_ENV: "production",
                    HOSTNAME: "0.0.0.0",
                    PORT: 4000,
                    NODE_OPTIONS: "--max-old-space-size=512",
                },
            },
        ],
    },
};

module.exports = configs[env] || configs.dev;

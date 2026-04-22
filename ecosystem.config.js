/**
 * PM2 설정 (운영 Lightsail 서버용)
 *
 * 사용:
 *   pm2 start ecosystem.config.js
 *
 * cwd = standalone 배포 루트 (node_modules 가 있는 곳). script = 그 안의 apps/앱명/server.js
 * 그래야 Next가 찾는 node_modules 를 올바르게 찾음 (MODULE_NOT_FOUND 방지).
 *
 * 서버 전용 런타임 env는 같은 디렉터리의 `.env.pm2.prod`에서 읽습니다.
 */

const fs = require("fs");
const path = require("path");

function loadPm2Env() {
    const filePath = path.join(__dirname, ".env.pm2.prod");

    if (!fs.existsSync(filePath)) {
        return {};
    }

    return fs
        .readFileSync(filePath, "utf8")
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#") && line.includes("="))
        .reduce((acc, line) => {
            const separatorIndex = line.indexOf("=");
            const key = line.slice(0, separatorIndex).trim();
            const rawValue = line.slice(separatorIndex + 1).trim();
            const value =
                (rawValue.startsWith('"') && rawValue.endsWith('"')) ||
                (rawValue.startsWith("'") && rawValue.endsWith("'"))
                    ? rawValue.slice(1, -1)
                    : rawValue;

            acc[key] = value;
            return acc;
        }, {});
}

const pm2Env = loadPm2Env();

function pickFirstDefined(...values) {
    return values.find((value) => value !== undefined && value !== "");
}

// standalone 을 배포한 루트 (node_modules, apps/ 가 있는 디렉터리)
const clientProdRoot =
    process.env.DEPLOY_CLIENT_DIR_PROD ||
    pm2Env.DEPLOY_CLIENT_DIR_PROD ||
    "/home/ec2-user/dongle.front.prod/current.client";
const adminProdRoot =
    process.env.DEPLOY_ADMIN_DIR_PROD ||
    pm2Env.DEPLOY_ADMIN_DIR_PROD ||
    "/home/ec2-user/dongle.front.prod/current.admin";

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

module.exports = {
    apps: [
        {
            ...commonAppConfig,
            name: "dongle.client.prod",
            cwd: clientProdRoot,
            script: `${clientProdRoot}/apps/DONGLE-CLIENT/server.js`,
            max_memory_restart: "700M",
            env: {
                ...pm2Env,
                NODE_ENV: "production",
                HOSTNAME: "0.0.0.0",
                PORT: 3000,
                NODE_OPTIONS: "--max-old-space-size=768",
                NEXT_PUBLIC_SENTRY_DSN: pickFirstDefined(
                    process.env.CLIENT_NEXT_PUBLIC_SENTRY_DSN,
                    pm2Env.CLIENT_NEXT_PUBLIC_SENTRY_DSN,
                    process.env.NEXT_PUBLIC_SENTRY_DSN,
                    pm2Env.NEXT_PUBLIC_SENTRY_DSN,
                ),
                SENTRY_DSN: pickFirstDefined(
                    process.env.SENTRY_DSN,
                    pm2Env.SENTRY_DSN,
                    process.env.CLIENT_NEXT_PUBLIC_SENTRY_DSN,
                    pm2Env.CLIENT_NEXT_PUBLIC_SENTRY_DSN,
                ),
                SENTRY_ENVIRONMENT: pickFirstDefined(
                    process.env.SENTRY_ENVIRONMENT,
                    pm2Env.SENTRY_ENVIRONMENT,
                ),
                SENTRY_RELEASE: pickFirstDefined(
                    process.env.SENTRY_RELEASE,
                    pm2Env.SENTRY_RELEASE,
                ),
            },
        },
        {
            ...commonAppConfig,
            name: "dongle.admin.prod",
            cwd: adminProdRoot,
            script: `${adminProdRoot}/apps/DONGLE-ADMIN/server.js`,
            max_memory_restart: "500M",
            env: {
                ...pm2Env,
                NODE_ENV: "production",
                HOSTNAME: "0.0.0.0",
                PORT: 4000,
                NODE_OPTIONS: "--max-old-space-size=512",
                NEXT_PUBLIC_SENTRY_DSN: pickFirstDefined(
                    process.env.ADMIN_NEXT_PUBLIC_SENTRY_DSN,
                    pm2Env.ADMIN_NEXT_PUBLIC_SENTRY_DSN,
                    process.env.NEXT_PUBLIC_SENTRY_DSN,
                    pm2Env.NEXT_PUBLIC_SENTRY_DSN,
                ),
                SENTRY_DSN: pickFirstDefined(
                    process.env.SENTRY_DSN,
                    pm2Env.SENTRY_DSN,
                    process.env.ADMIN_NEXT_PUBLIC_SENTRY_DSN,
                    pm2Env.ADMIN_NEXT_PUBLIC_SENTRY_DSN,
                ),
                SENTRY_ENVIRONMENT: pickFirstDefined(
                    process.env.SENTRY_ENVIRONMENT,
                    pm2Env.SENTRY_ENVIRONMENT,
                ),
                SENTRY_RELEASE: pickFirstDefined(
                    process.env.SENTRY_RELEASE,
                    pm2Env.SENTRY_RELEASE,
                ),
            },
        },
    ],
};

import { afterEach, expect, test } from "vitest";
import { copyFileSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const originalJwtSecret = process.env.JWT_SECRET;

afterEach(() => {
    if (originalJwtSecret === undefined) {
        delete process.env.JWT_SECRET;
    } else {
        process.env.JWT_SECRET = originalJwtSecret;
    }
});

test("PM2 client는 설정 파일과 이전 상속 환경의 JWT_SECRET을 받지 않고 ADMIN은 설정값을 유지한다", async () => {
    const tempRoot = mkdtempSync(path.join(tmpdir(), "dongle-pm2-env-"));
    try {
        const configPath = path.join(tempRoot, "ecosystem.config.js");
        copyFileSync(fileURLToPath(new URL("../../../../../ecosystem.config.js", import.meta.url)), configPath);
        writeFileSync(path.join(tempRoot, ".env.pm2.prod"), "JWT_SECRET=fixture-admin-secret\n");
        process.env.JWT_SECRET = "stale-inherited-secret";

        const requireFromTemp = createRequire(configPath);
        const config = requireFromTemp(configPath) as {
            apps: Array<{ name: string; env: Record<string, string | undefined> }>;
        };
        const client = config.apps.find((app) => app.name === "dongle.client.prod");
        const admin = config.apps.find((app) => app.name === "dongle.admin.prod");

        expect(client?.env.JWT_SECRET).toBe("");
        expect(admin?.env.JWT_SECRET).toBe("fixture-admin-secret");
    } finally {
        rmSync(tempRoot, { recursive: true, force: true });
    }
});

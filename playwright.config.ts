import fs from "node:fs";
import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

function loadLocalEnv() {
    const envPath = path.resolve(process.cwd(), ".env.local");

    if (!fs.existsSync(envPath)) {
        return;
    }

    const envLines = fs.readFileSync(envPath, "utf8").split("\n");

    for (const line of envLines) {
        const trimmedLine = line.trim();

        if (!trimmedLine || trimmedLine.startsWith("#")) {
            continue;
        }

        const separatorIndex = trimmedLine.indexOf("=");

        if (separatorIndex === -1) {
            continue;
        }

        const key = trimmedLine.slice(0, separatorIndex).trim();
        const rawValue = trimmedLine.slice(separatorIndex + 1).trim();
        const value = rawValue.replace(/^['"]|['"]$/g, "");

        if (!process.env[key]) {
            process.env[key] = value;
        }
    }
}

loadLocalEnv();

const isCI = Boolean(process.env.CI);
const clientCommand = isCI
    ? "pnpm --filter dongle-client build && pnpm --filter dongle-client start:e2e"
    : "pnpm --filter dongle-client dev";
const adminCommand = isCI
    ? "pnpm --filter dongle-admin build && pnpm --filter dongle-admin start:e2e"
    : "pnpm --filter dongle-admin dev";
const clientTimeout = isCI ? 180_000 : 120_000;
const adminTimeout = isCI ? 300_000 : 120_000;

export default defineConfig({
    testDir: "./e2e",
    fullyParallel: false,
    forbidOnly: isCI,
    retries: isCI ? 2 : 0,
    workers: isCI ? undefined : 1,
    reporter: [["list"], ["html", { open: "never" }]],
    use: {
        trace: "on-first-retry",
        screenshot: "only-on-failure",
        video: "retain-on-failure",
    },
    projects: [
        {
            name: "client",
            testDir: "./e2e/client",
            use: {
                ...devices["Desktop Chrome"],
                baseURL: "http://127.0.0.1:4000",
            },
        },
        {
            name: "admin",
            testDir: "./e2e/admin",
            use: {
                ...devices["Desktop Chrome"],
                baseURL: "http://127.0.0.1:4001",
            },
        },
        {
            name: "club",
            testDir: "./e2e/club",
            use: {
                ...devices["Desktop Chrome"],
                baseURL: "http://127.0.0.1:4001",
            },
        },
    ],
    webServer: [
        {
            command: clientCommand,
            url: "http://127.0.0.1:4000",
            reuseExistingServer: !isCI,
            stdout: "pipe",
            stderr: "pipe",
            timeout: clientTimeout,
        },
        {
            command: adminCommand,
            url: "http://127.0.0.1:4001",
            reuseExistingServer: !isCI,
            stdout: "pipe",
            stderr: "pipe",
            timeout: adminTimeout,
        },
    ],
});

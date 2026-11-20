import { defineConfig, devices } from "@playwright/test";
import { readDevEnvironment } from "./e2e/fixtures/dev-environment";

const target = readDevEnvironment(process.env);

export default defineConfig({
    testDir: "./e2e/dev",
    fullyParallel: false,
    workers: 1,
    retries: 0,
    forbidOnly: Boolean(process.env.CI),
    timeout: 120_000,
    expect: { timeout: 15_000 },
    reporter: [["list"], ["junit", { outputFile: "test-results/dev-e2e.xml" }]],
    use: {
        ...devices["Desktop Chrome"],
        baseURL: target.adminUrl,
        trace: "off",
        screenshot: "off",
        video: "off",
        serviceWorkers: "block",
    },
});

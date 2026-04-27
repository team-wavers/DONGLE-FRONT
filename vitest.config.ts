import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        projects: [
            "./apps/DONGLE-ADMIN/vitest.config.ts",
            "./apps/DONGLE-CLIENT/vitest.config.ts",
            "./packages/rich-text/vitest.config.ts",
            "./e2e/vitest.config.ts",
        ],
    },
});

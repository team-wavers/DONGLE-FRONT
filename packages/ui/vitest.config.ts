import { defineProject } from "vitest/config";

export default defineProject({
    test: {
        name: "ui",
        environment: "node",
        include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    },
});

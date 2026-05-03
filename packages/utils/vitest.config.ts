import { defineProject } from "vitest/config";

export default defineProject({
    test: {
        name: "utils",
        environment: "node",
        include: ["src/**/*.test.ts"],
    },
});

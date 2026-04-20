import { defineProject } from "vitest/config";

export default defineProject({
    test: {
        name: "rich-text",
        environment: "node",
        include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    },
});

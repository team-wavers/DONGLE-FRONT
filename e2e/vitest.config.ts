import { defineProject } from "vitest/config";

export default defineProject({
    test: {
        name: "e2e-fixtures",
        environment: "node",
        include: ["fixtures/**/*.test.ts", "fixtures/**/*.test.tsx"],
    },
});

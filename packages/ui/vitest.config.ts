import path from "node:path";
import { defineProject } from "vitest/config";

export default defineProject({
    test: {
        name: "ui",
        environment: "node",
        include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    },
    resolve: {
        alias: [
            { find: /^@dongle\/utils$/, replacement: path.resolve(__dirname, "../utils/src/index.ts") },
            { find: /^@dongle\/utils\/(.*)$/, replacement: `${path.resolve(__dirname, "../utils/src")}/$1` },
        ],
    },
});

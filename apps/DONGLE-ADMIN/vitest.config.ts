import path from "node:path";
import { defineProject } from "vitest/config";

export default defineProject({
    test: {
        name: "admin",
        environment: "node",
        include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    },
    resolve: {
        alias: [
            { find: /^@\/(.*)$/, replacement: `${path.resolve(__dirname, "./src")}/$1` },
            { find: /^@dongle\/api$/, replacement: path.resolve(__dirname, "../../packages/api/src/index.ts") },
            { find: /^@dongle\/api\/(.*)$/, replacement: `${path.resolve(__dirname, "../../packages/api/src")}/$1` },
            { find: /^@dongle\/service$/, replacement: path.resolve(__dirname, "../../packages/service/src/index.ts") },
            {
                find: /^@dongle\/service\/(.*)$/,
                replacement: `${path.resolve(__dirname, "../../packages/service/src")}/$1`,
            },
            { find: /^@dongle\/rich-text$/, replacement: path.resolve(__dirname, "../../packages/rich-text/src/index.ts") },
            {
                find: /^@dongle\/rich-text\/(.*)$/,
                replacement: `${path.resolve(__dirname, "../../packages/rich-text/src")}/$1`,
            },
            { find: /^@dongle\/types$/, replacement: path.resolve(__dirname, "../../packages/types/src/index.ts") },
            { find: /^@dongle\/types\/(.*)$/, replacement: `${path.resolve(__dirname, "../../packages/types/src")}/$1` },
            { find: /^@dongle\/ui$/, replacement: path.resolve(__dirname, "../../packages/ui/src/index.ts") },
            { find: /^@dongle\/ui\/(.*)$/, replacement: `${path.resolve(__dirname, "../../packages/ui/src")}/$1` },
            { find: /^@dongle\/utils$/, replacement: path.resolve(__dirname, "../../packages/utils/src/index.ts") },
            { find: /^@dongle\/utils\/(.*)$/, replacement: `${path.resolve(__dirname, "../../packages/utils/src")}/$1` },
        ],
    },
});

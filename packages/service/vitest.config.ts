import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineProject } from "vitest/config";

const utilsSrc = path.resolve(fileURLToPath(new URL("../utils/src", import.meta.url)));

export default defineProject({
    resolve: {
        alias: [
            { find: /^@dongle\/utils$/, replacement: path.resolve(utilsSrc, "index.ts") },
            { find: /^@dongle\/utils\/(.*)$/, replacement: `${utilsSrc}/$1` },
        ],
    },
    test: {
        name: "service",
        environment: "node",
        include: ["src/**/*.test.ts"],
    },
});

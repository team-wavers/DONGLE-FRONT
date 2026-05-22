import path from "node:path";
import { defineProject } from "vitest/config";
import { createDongleWorkspaceAliases } from "../../vitest.workspace-alias";

export default defineProject({
    test: {
        name: "admin",
        environment: "node",
        include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    },
    resolve: {
        alias: [
            { find: /^@\/(.*)$/, replacement: `${path.resolve(__dirname, "./src")}/$1` },
            ...createDongleWorkspaceAliases(__dirname),
        ],
    },
});

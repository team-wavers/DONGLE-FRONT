import path from "node:path";

export const DONGLE_WORKSPACE_PACKAGES = [
    "api",
    "content",
    "rich-text",
    "service",
    "types",
    "ui",
    "utils",
] as const;

export function createDongleWorkspaceAliases(dirname: string) {
    return DONGLE_WORKSPACE_PACKAGES.flatMap((pkg) => {
        const packageRoot = path.resolve(dirname, `../../packages/${pkg}/src`);
        return [
            { find: new RegExp(`^@dongle/${pkg}$`), replacement: path.resolve(packageRoot, "index.ts") },
            { find: new RegExp(`^@dongle/${pkg}/(.*)$`), replacement: `${packageRoot}/$1` },
        ];
    });
}

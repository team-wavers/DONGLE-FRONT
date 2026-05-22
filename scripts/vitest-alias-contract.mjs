import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const packagePattern = /@dongle\/([a-z-]+)/g;

const helperPath = path.join(rootDir, "vitest.workspace-alias.ts");
const helperContent = fs.readFileSync(helperPath, "utf8");

const packageListMatch = helperContent.match(/DONGLE_WORKSPACE_PACKAGES = \[([\s\S]*?)\] as const/);
if (!packageListMatch) {
    console.error("Vitest alias contract failed: DONGLE_WORKSPACE_PACKAGES를 찾을 수 없습니다.");
    process.exit(1);
}

const configuredPackages = new Set(
    Array.from(packageListMatch[1].matchAll(/"([a-z-]+)"/g)).map((match) => `@dongle/${match[1]}`)
);

const projects = [
    { name: "admin", sourceDir: path.join(rootDir, "apps/DONGLE-ADMIN/src") },
    { name: "client", sourceDir: path.join(rootDir, "apps/DONGLE-CLIENT/src") },
];

function collectFiles(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...collectFiles(fullPath));
            continue;
        }

        if (/\.(ts|tsx|mts|cts)$/.test(entry.name)) {
            files.push(fullPath);
        }
    }

    return files;
}

const errors = [];

for (const project of projects) {
    const required = new Set();
    for (const filePath of collectFiles(project.sourceDir)) {
        const content = fs.readFileSync(filePath, "utf8");
        for (const match of content.matchAll(packagePattern)) {
            required.add(`@dongle/${match[1]}`);
        }
    }

    const missing = [...required].filter((pkg) => !configuredPackages.has(pkg));
    if (missing.length > 0) {
        errors.push(`[${project.name}] alias 누락: ${missing.sort().join(", ")}`);
    }
}

if (errors.length > 0) {
    console.error("Vitest alias contract failed:\n" + errors.join("\n"));
    process.exit(1);
}

console.log("Vitest alias contract passed");

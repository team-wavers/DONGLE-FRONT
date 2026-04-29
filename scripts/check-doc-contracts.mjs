import fs from "node:fs";
import path from "node:path";

import { execSync } from "node:child_process";

const rootDir = process.cwd();
const workspacePathPrefix = "/Users/bigsheep/Desktop/projects/DONGLE-FRONT";

const requiredFiles = [
    "AGENTS.md",
    "docs/evals/README.md",
    "docs/evals/success-criteria.md",
    "docs/evals/test-inventory.md",
    "docs/evals/known-gaps.md",
    "docs/evals/roadmap.md",
    "docs/evals/infra-assumptions.md",
    "docs/harness/roadmap.md",
];

const commandTruthFiles = [
    "AGENTS.md",
    "docs/evals/README.md",
    "docs/evals/roadmap.md",
    "docs/evals/infra-assumptions.md",
];
const forbiddenHarnessRefs = ["AGENTS.md", "docs/evals/README.md"];
const commandTruth = "pnpm verify:fast";
const harnessPath = "docs/harness/roadmap.md";
const markdownLinkPattern = /\[[^\]]+\]\(([^)]+)\)/g;
const markdownFilesToValidate = [
    "AGENTS.md",
    "docs/evals/README.md",
    "docs/evals/success-criteria.md",
    "docs/evals/test-inventory.md",
    "docs/evals/known-gaps.md",
    "docs/evals/roadmap.md",
    "docs/evals/infra-assumptions.md",
    "docs/harness/roadmap.md",
];

const errors = [];
const warnings = [];

const inventoryDocPath = "docs/evals/test-inventory.md";
const successCriteriaDocPath = "docs/evals/success-criteria.md";
const knownGapsDocPath = "docs/evals/known-gaps.md";
const trackedTestFileAllowPatterns = [
    /^apps\/DONGLE-ADMIN\/src\/.+\.(test|spec)\.(ts|tsx|js|jsx|mjs|cjs)$/,
    /^apps\/DONGLE-CLIENT\/src\/.+\.(test|spec)\.(ts|tsx|js|jsx|mjs|cjs)$/,
    /^packages\/.+\.(test|spec)\.(ts|tsx|js|jsx|mjs|cjs)$/,
    /^e2e\/.+\.(test|spec)\.(ts|tsx|js|jsx|mjs|cjs)$/,
];

function readFile(relativePath) {
    return fs.readFileSync(path.join(rootDir, relativePath), "utf8");
}

function validateMarkdownLinks(relativePath) {
    const content = readFile(relativePath);
    const fileDir = path.dirname(path.join(rootDir, relativePath));

    if (content.includes(workspacePathPrefix)) {
        errors.push(`절대경로가 남아 있습니다: ${relativePath}`);
    }

    for (const match of content.matchAll(markdownLinkPattern)) {
        const rawTarget = match[1].split("#")[0];

        if (rawTarget.length === 0) {
            continue;
        }

        if (rawTarget.startsWith("http://") || rawTarget.startsWith("https://")) {
            continue;
        }

        const normalizedTarget = rawTarget.split(":")[0];

        const resolvedTarget = path.isAbsolute(normalizedTarget)
            ? normalizedTarget
            : path.resolve(fileDir, normalizedTarget);

        if (!fs.existsSync(resolvedTarget)) {
            errors.push(`${relativePath}의 링크 대상 파일이 없습니다: ${normalizedTarget}`);
        }
    }
}

for (const relativePath of requiredFiles) {
    const absolutePath = path.join(rootDir, relativePath);

    if (!fs.existsSync(absolutePath)) {
        errors.push(`필수 문서가 없습니다: ${relativePath}`);
    }
}

for (const relativePath of commandTruthFiles) {
    const content = readFile(relativePath);

    if (!content.includes(commandTruth)) {
        errors.push(`기본 명령 ${commandTruth} 이(가) 문서에 없습니다: ${relativePath}`);
    }
}

for (const relativePath of forbiddenHarnessRefs) {
    const content = readFile(relativePath);

    if (content.includes(harnessPath)) {
        errors.push(`에이전트 운영 문서에서 하네스 설계 문서를 참조하면 안 됩니다: ${relativePath}`);
    }
}

const agentsContent = readFile("AGENTS.md");
const requiredAgentLinks = [
    "docs/evals/README.md",
    "docs/evals/success-criteria.md",
    "docs/evals/test-inventory.md",
    "docs/evals/known-gaps.md",
    "docs/evals/roadmap.md",
];

for (const link of requiredAgentLinks) {
    if (!agentsContent.includes(link)) {
        errors.push(`AGENTS.md에 필수 eval 문서 링크가 없습니다: ${link}`);
    }
}

for (const relativePath of markdownFilesToValidate) {
    validateMarkdownLinks(relativePath);
}

validateTestInventorySyncRule();


function getGitStatusEntries() {
    const output = execSync("git status --porcelain", { encoding: "utf8" });

    return output
        .split("\n")
        .filter((line) => line.length >= 4)
        .map((line) => {
            const rawStatus = line.slice(0, 2);
            const status = rawStatus === "??" ? "A" : rawStatus;
            const rawPath = line.slice(3);
            const filePath = rawPath.includes(" -> ") ? rawPath.split(" -> ").at(-1) : rawPath;

            return { status, filePath };
        });
}

function isTestFilePath(filePath) {
    return trackedTestFileAllowPatterns.some((pattern) => pattern.test(filePath));
}

function validateTestInventorySyncRule() {
    const entries = getGitStatusEntries();
    const changedPaths = new Set(entries.map((entry) => entry.filePath));
    const addedOrDeletedTests = entries.filter((entry) =>
        (entry.status.includes("A") || entry.status.includes("D")) && /\.(test|spec)\.(ts|tsx|js|jsx|mjs|cjs)$/.test(entry.filePath),
    );

    const trackedTestChanges = addedOrDeletedTests.filter((entry) => isTestFilePath(entry.filePath));
    const untrackedPatternTestChanges = addedOrDeletedTests.filter((entry) => !isTestFilePath(entry.filePath));

    if (untrackedPatternTestChanges.length > 0) {
        warnings.push(
            `허용 패턴 밖 테스트 파일 변경 감지: ${untrackedPatternTestChanges
                .map((entry) => `${entry.status} ${entry.filePath}`)
                .join(", ")} (필요 시 패턴 추가 검토)`,
        );
    }

    if (trackedTestChanges.length === 0) {
        return;
    }

    if (!changedPaths.has(inventoryDocPath)) {
        errors.push(
            [
                "테스트 파일 추가/삭제가 감지되었습니다.",
                `- 변경된 테스트: ${trackedTestChanges.map((entry) => `${entry.status} ${entry.filePath}`).join(", ")}`,
                `- ${inventoryDocPath} 갱신 여부를 확인하세요.`,
                `- 필요 시 함께 검토할 문서: ${successCriteriaDocPath}, ${knownGapsDocPath}`,
            ].join("\n"),
        );
    }
}

if (errors.length > 0) {
    console.error("문서 계약 검증 실패:");

    for (const error of errors) {
        console.error(`- ${error}`);
    }

    process.exit(1);
}

if (warnings.length > 0) {
    console.warn("문서 계약 경고:");

    for (const warning of warnings) {
        console.warn(`- ${warning}`);
    }
}

console.log("문서 계약 검증 통과");

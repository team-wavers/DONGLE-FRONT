import fs from "node:fs";
import path from "node:path";

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
        const rawTarget = match[1].split("#")[0].split(":")[0];

        if (rawTarget.length === 0) {
            continue;
        }

        if (rawTarget.startsWith("http://") || rawTarget.startsWith("https://")) {
            continue;
        }

        const resolvedTarget = path.isAbsolute(rawTarget) ? rawTarget : path.resolve(fileDir, rawTarget);

        if (!fs.existsSync(resolvedTarget)) {
            errors.push(`${relativePath}의 링크 대상 파일이 없습니다: ${rawTarget}`);
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

if (errors.length > 0) {
    console.error("문서 계약 검증 실패:");

    for (const error of errors) {
        console.error(`- ${error}`);
    }

    process.exit(1);
}

console.log("문서 계약 검증 통과");

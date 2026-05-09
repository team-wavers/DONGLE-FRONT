type ReportActionErrorBranch = "auth" | "upload" | "service" | "exception";

export type ReportActionErrorResult = {
    errorType: "form";
    error: string;
    retryable: boolean;
    retryHint?: string;
    sessionExpired?: boolean;
};

interface BuildReportActionErrorOptions {
    branch: ReportActionErrorBranch;
    actionLabel: "create" | "update";
}

const ACTION_LABEL_KR: Record<BuildReportActionErrorOptions["actionLabel"], string> = {
    create: "생성",
    update: "수정",
};

export function buildReportActionError({
    branch,
    actionLabel,
}: BuildReportActionErrorOptions): ReportActionErrorResult {
    const actionLabelKr = ACTION_LABEL_KR[actionLabel];

    if (branch === "auth") {
        return {
            errorType: "form",
            error: "로그인 시간이 만료되었습니다. 다시 로그인해주세요.",
            retryable: false,
            sessionExpired: true,
        };
    }

    if (branch === "upload") {
        return {
            errorType: "form",
            error: "이미지 업로드에 실패했습니다. 다시 시도해주세요.",
            retryable: true,
            retryHint: "네트워크 상태를 확인한 뒤 다시 시도해주세요.",
        };
    }

    if (branch === "service") {
        return {
            errorType: "form",
            error: `활동보고서 ${actionLabelKr}에 실패했습니다. 다시 시도해주세요.`,
            retryable: true,
            retryHint: "잠시 후 다시 시도해주세요.",
        };
    }

    return {
        errorType: "form",
        error: `활동보고서 ${actionLabelKr} 중 오류가 발생했습니다. 다시 시도해주세요.`,
        retryable: true,
        retryHint: "문제가 계속되면 관리자에게 문의해주세요.",
    };
}

export function isUnauthorizedError(error: unknown): boolean {
    return error instanceof Error && error.message === "Unauthorized";
}

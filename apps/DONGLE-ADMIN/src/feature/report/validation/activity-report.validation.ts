export interface ActivityReportFieldErrors {
    title?: string;
    content?: string;
    reportDate?: string;
    images?: string;
}

export interface ActivityReportInput {
    title: string;
    content: string;
}

export function validateActivityReportInput(input: ActivityReportInput): {
    fieldErrors: ActivityReportFieldErrors;
    isValid: boolean;
} {
    const fieldErrors: ActivityReportFieldErrors = {};
    const title = input.title ?? "";
    const content = input.content ?? "";

    if (!title) {
        fieldErrors.title = "제목을 입력해주세요";
    } else if (title.length < 2) {
        fieldErrors.title = "제목은 최소 2자 이상이어야 합니다";
    } else if (title.length > 100) {
        fieldErrors.title = "제목은 최대 100자 이하여야 합니다";
    }

    if (!content) {
        fieldErrors.content = "내용을 입력해주세요";
    } else if (content.length < 10) {
        fieldErrors.content = "내용은 최소 10자 이상이어야 합니다";
    }

    return {
        fieldErrors,
        isValid: Object.keys(fieldErrors).length === 0,
    };
}

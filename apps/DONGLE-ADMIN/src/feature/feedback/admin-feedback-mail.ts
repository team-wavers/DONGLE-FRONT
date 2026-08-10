export const ADMIN_FEEDBACK_RECIPIENT = "z62314386@gmail.com";

export const ADMIN_FEEDBACK_CATEGORIES = [
    { value: "bug", label: "오류가 발생했어요", subjectLabel: "오류" },
    { value: "inconvenience", label: "사용하기 불편해요", subjectLabel: "불편" },
    { value: "feature", label: "새로운 기능을 제안해요", subjectLabel: "기능 제안" },
    { value: "other", label: "기타 문의", subjectLabel: "기타" },
] as const;

export type AdminFeedbackCategory = (typeof ADMIN_FEEDBACK_CATEGORIES)[number]["value"];
export type AdminFeedbackRole = "admin" | "club-president";

interface AdminFeedbackInput {
    category: AdminFeedbackCategory;
    content: string;
    pageUrl: string;
    role: AdminFeedbackRole;
    clubId?: string;
    createdAt?: Date;
}

interface AdminFeedbackValidationInput {
    category: AdminFeedbackCategory | "";
    content: string;
}

export function validateAdminFeedback({ category, content }: AdminFeedbackValidationInput) {
    return {
        ...(!category ? { category: "문의 유형을 선택해주세요." } : {}),
        ...(!content.trim() ? { content: "문의 내용을 입력해주세요." } : {}),
    };
}

export function buildAdminFeedbackMailto({
    category,
    content,
    pageUrl,
    role,
    clubId,
    createdAt = new Date(),
}: AdminFeedbackInput) {
    const categoryConfig = ADMIN_FEEDBACK_CATEGORIES.find((item) => item.value === category);
    const roleLabel = role === "admin" ? "총동아리연합회 관리자" : "동아리 회장";
    const clubLine = role === "club-president" && clubId ? `\n- 동아리 ID: ${clubId}` : "";
    const subject = `[동글 어드민][${categoryConfig?.subjectLabel ?? "문의"}] 버그 및 개선사항 문의`;
    const body = `안녕하세요. 동글 어드민 문의입니다.

[문의 정보]
- 문의 유형: ${categoryConfig?.label ?? "기타 문의"}
- 사용자 역할: ${roleLabel}${clubLine}
- 현재 화면: ${pageUrl}
- 작성 시각: ${createdAt.toISOString()}

[문의 내용]
${content.trim()}

확인 부탁드립니다.`;
    const searchParams = new URLSearchParams({ subject, body });

    return `mailto:${ADMIN_FEEDBACK_RECIPIENT}?${searchParams.toString()}`;
}

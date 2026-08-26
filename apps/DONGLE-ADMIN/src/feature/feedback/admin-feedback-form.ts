import type { FeedbackCategory } from "@dongle/types/feedback/feedback";

export const ADMIN_FEEDBACK_CATEGORIES = [
    { value: "bug", label: "오류가 발생했어요" },
    { value: "inconvenience", label: "사용하기 불편해요" },
    { value: "feature", label: "새로운 기능을 제안해요" },
    { value: "other", label: "기타 문의" },
] as const satisfies { value: FeedbackCategory; label: string }[];

const ADMIN_FEEDBACK_CATEGORY_VALUES = ADMIN_FEEDBACK_CATEGORIES.map((item) => item.value);

interface AdminFeedbackValidationInput {
    category: FeedbackCategory | "";
    content: string;
}

export function validateAdminFeedback({ category, content }: AdminFeedbackValidationInput) {
    return {
        ...(!category || !ADMIN_FEEDBACK_CATEGORY_VALUES.includes(category)
            ? { category: "문의 유형을 선택해주세요." }
            : {}),
        ...(!content.trim() ? { content: "문의 내용을 입력해주세요." } : {}),
    };
}

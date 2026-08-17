import { describe, expect, it } from "vitest";
import { ADMIN_FEEDBACK_CATEGORIES, validateAdminFeedback } from "./admin-feedback-form";

describe("ADMIN_FEEDBACK_CATEGORIES", () => {
    it("카테고리 4개(bug/inconvenience/feature/other)를 제공한다", () => {
        expect(ADMIN_FEEDBACK_CATEGORIES.map((item) => item.value)).toEqual([
            "bug",
            "inconvenience",
            "feature",
            "other",
        ]);
    });
});

describe("validateAdminFeedback", () => {
    it("category가 비어있으면 category 오류를 반환한다", () => {
        const errors = validateAdminFeedback({ category: "", content: "문의합니다" });

        expect(errors.category).toBeDefined();
        expect(errors.content).toBeUndefined();
    });

    it("content가 공백만 있으면 content 오류를 반환한다", () => {
        const errors = validateAdminFeedback({ category: "bug", content: "   " });

        expect(errors.content).toBeDefined();
        expect(errors.category).toBeUndefined();
    });

    it("category와 content가 모두 있으면 오류가 없다", () => {
        const errors = validateAdminFeedback({ category: "feature", content: "기능 제안입니다" });

        expect(errors).toEqual({});
    });
});

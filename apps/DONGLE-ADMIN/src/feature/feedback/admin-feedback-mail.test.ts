import { describe, expect, test } from "vitest";
import {
    ADMIN_FEEDBACK_RECIPIENT,
    buildAdminFeedbackMailto,
    validateAdminFeedback,
} from "./admin-feedback-mail";

describe("admin-feedback-mail", () => {
    test("문의 유형, 내용, 화면과 관리자 역할을 인코딩한 메일 URL을 만든다", () => {
        const mailto = buildAdminFeedbackMailto({
            category: "bug",
            content: "저장 버튼을 눌러도\n내용이 반영되지 않습니다.",
            pageUrl: "https://admin.example.com/admin/banner?tab=active",
            role: "admin",
            createdAt: new Date("2026-08-10T12:34:00.000Z"),
        });

        expect(mailto.startsWith(`mailto:${ADMIN_FEEDBACK_RECIPIENT}?`)).toBe(true);

        const url = new URL(mailto);
        expect(url.searchParams.get("subject")).toBe("[동글 어드민][오류] 버그 및 개선사항 문의");
        expect(url.searchParams.get("body")).toContain("문의 유형: 오류가 발생했어요");
        expect(url.searchParams.get("body")).toContain("사용자 역할: 총동아리연합회 관리자");
        expect(url.searchParams.get("body")).toContain(
            "현재 화면: https://admin.example.com/admin/banner?tab=active"
        );
        expect(url.searchParams.get("body")).toContain("저장 버튼을 눌러도\n내용이 반영되지 않습니다.");
        expect(url.searchParams.get("body")).not.toContain("동아리 ID:");
    });

    test("동아리 회장 문의에는 동아리 ID를 포함한다", () => {
        const mailto = buildAdminFeedbackMailto({
            category: "feature",
            content: "일정을 복사하는 기능이 필요합니다.",
            pageUrl: "https://admin.example.com/123/schedule",
            role: "club-president",
            clubId: "123",
            createdAt: new Date("2026-08-10T12:34:00.000Z"),
        });

        const url = new URL(mailto);
        expect(url.searchParams.get("subject")).toBe("[동글 어드민][기능 제안] 버그 및 개선사항 문의");
        expect(url.searchParams.get("body")).toContain("사용자 역할: 동아리 회장");
        expect(url.searchParams.get("body")).toContain("동아리 ID: 123");
    });

    test("문의 유형과 trim한 내용은 필수다", () => {
        expect(validateAdminFeedback({ category: "", content: "   " })).toEqual({
            category: "문의 유형을 선택해주세요.",
            content: "문의 내용을 입력해주세요.",
        });
        expect(validateAdminFeedback({ category: "other", content: " 문의 내용 " })).toEqual({});
    });
});

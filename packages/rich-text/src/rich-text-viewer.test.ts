import { describe, expect, it } from "vitest";
import { sanitizeRichTextForViewer } from "./rich-text-viewer";

describe("sanitizeRichTextForViewer", () => {
    it("DOMPurify 로드가 실패해도 pending을 종료할 수 있는 fallback HTML을 반환한다", async () => {
        const html = await sanitizeRichTextForViewer("<p>소개</p>", async () => {
            throw new Error("load failed");
        });

        expect(html).toBe("");
    });
});

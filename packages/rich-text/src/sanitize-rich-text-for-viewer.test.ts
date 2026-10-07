import { afterEach, describe, expect, it, vi } from "vitest";
import { sanitizeRichTextForViewer } from "./sanitize-rich-text-for-viewer";

describe("sanitizeRichTextForViewer", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it.each([
        {
            field: "동아리 소개",
            input: "<p>함께 배우는 <strong>독서 동아리</strong>입니다.</p>",
            expected: ["함께 배우는", "<strong>독서 동아리</strong>", "입니다."],
        },
        {
            field: "주요 활동",
            input: '<ul><li>매주 독서 토론</li><li><a href="https://example.com/activities">활동 안내</a></li></ul>',
            expected: ["<ul>", "매주 독서 토론", "활동 안내", 'href="https://example.com/activities"'],
        },
    ])("Node 환경에서 실제 sanitizer로 $field 본문과 서식을 보존한다", async ({ input, expected }) => {
        expect(typeof window).toBe("undefined");
        expect(typeof document).toBe("undefined");

        const html = await sanitizeRichTextForViewer(input);

        for (const content of expected) {
            expect(html).toContain(content);
        }
    }, 30_000);

    it("실제 sanitizer로 일반 텍스트의 줄바꿈과 특수문자를 안전하게 보존한다", async () => {
        const html = await sanitizeRichTextForViewer("첫 번째 활동\n5 > 3 & 2 < 4");

        expect(html).toContain("첫 번째 활동");
        expect(html).toMatch(/<br\s*\/?\s*>/);
        expect(html).toContain("5 &gt; 3 &amp; 2 &lt; 4");
    }, 30_000);

    it("실제 sanitizer로 script·이벤트 속성·javascript URL을 제거하면서 정상 본문과 이미지를 보존한다", async () => {
        const html = await sanitizeRichTextForViewer(
            '<p onclick="alert(1)">동아리 소개</p><script>alert("unsafe-script")</script>' +
            '<a href="javascript:alert(2)">활동 안내</a>' +
            '<img src="https://example.com/club.png" alt="활동 사진" onerror="alert(3)">'
        );

        expect(html).toContain("동아리 소개");
        expect(html).toContain("활동 안내");
        expect(html).toContain('src="https://example.com/club.png"');
        expect(html).toContain('alt="활동 사진"');
        expect(html).not.toMatch(/<script\b|unsafe-script|\bonclick\s*=|\bonerror\s*=|javascript:/i);
    }, 30_000);

    it("DOMPurify 로드 실패 원인을 기록하고 빈 HTML을 반환한다", async () => {
        const error = new Error("load failed");
        const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});
        const html = await sanitizeRichTextForViewer("<p>소개</p>", async () => {
            throw error;
        });

        expect(html).toBe("");
        expect(errorLog).toHaveBeenCalledExactlyOnceWith("[rich-text] Failed to sanitize viewer HTML", error);
    });
});

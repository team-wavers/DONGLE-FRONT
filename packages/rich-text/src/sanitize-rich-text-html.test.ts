import { expect, test } from "vitest";
import { normalizeRichTextHtml } from "./sanitize-rich-text-html";

test("normalizeRichTextHtml은 빈 문자열을 그대로 비운다", () => {
    expect(normalizeRichTextHtml("   ")).toBe("");
});

test("normalizeRichTextHtml은 일반 텍스트를 안전한 HTML로 이스케이프한다", () => {
    expect(
        normalizeRichTextHtml('5 > 3 & 2\n"quote"'),
        "5 &gt; 3 &amp; 2<br />&quot;quote&quot;"
    ).toBe("5 &gt; 3 &amp; 2<br />&quot;quote&quot;");
});

test("normalizeRichTextHtml은 이미 HTML인 값은 그대로 둔다", () => {
    expect(normalizeRichTextHtml("<p>hello</p>")).toBe("<p>hello</p>");
});

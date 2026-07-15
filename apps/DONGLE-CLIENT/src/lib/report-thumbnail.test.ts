import { describe, expect, it } from "vitest";
import { resolveReportThumbnailUrl } from "./report-thumbnail";

describe("resolveReportThumbnailUrl", () => {
    it("image_urls에 유효한 값이 있으면 해당 값을 우선 사용한다", () => {
        const result = resolveReportThumbnailUrl(
            ["https://example.com/a.png"],
            '<p>본문 <img src="https://example.com/content.png" /></p>'
        );

        expect(result).toBe("https://example.com/a.png");
    });

    it("image_urls가 빈 문자열만 포함하면 content에서 첫 이미지를 추출한다", () => {
        const result = resolveReportThumbnailUrl(["", "   "], '<p>본문 <img src="https://example.com/content.png" /></p>');

        expect(result).toBe("https://example.com/content.png");
    });

    it("image_urls가 비어있으면 content에서 첫 이미지를 추출한다", () => {
        const result = resolveReportThumbnailUrl(
            [],
            '<p>본문</p><img src="https://example.com/first.png"><img src="https://example.com/second.png">'
        );

        expect(result).toBe("https://example.com/first.png");
    });

    it("image_urls도 없고 content에도 이미지가 없으면 null을 반환한다", () => {
        const result = resolveReportThumbnailUrl([], "<p>이미지가 없는 본문입니다.</p>");

        expect(result).toBeNull();
    });

    it("content의 img 태그 속성 순서가 달라도 src를 추출한다", () => {
        const result = resolveReportThumbnailUrl([], '<img alt="썸네일" src="https://example.com/order.png" />');

        expect(result).toBe("https://example.com/order.png");
    });
});

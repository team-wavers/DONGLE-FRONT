import { describe, expect, it } from "vitest";
import { normalizeExternalUrl } from "./url";

describe("normalizeExternalUrl", () => {
    it("프로토콜 없는 외부 링크는 https URL로 정규화한다", () => {
        expect(normalizeExternalUrl(" dongle.kr/schedule?tab=event ")).toBe("https://dongle.kr/schedule?tab=event");
        expect(normalizeExternalUrl("example.com:8080/path")).toBe("https://example.com:8080/path");
    });

    it("http와 https 외부 링크는 허용한다", () => {
        expect(normalizeExternalUrl("https://dongle.kr/schedule")).toBe("https://dongle.kr/schedule");
        expect(normalizeExternalUrl("http://dongle.kr/schedule")).toBe("http://dongle.kr/schedule");
        expect(normalizeExternalUrl("//dongle.kr/schedule")).toBe("https://dongle.kr/schedule");
        expect(normalizeExternalUrl("https://127.0.0.1:4001/schedule")).toBe("https://127.0.0.1:4001/schedule");
    });

    it("위험하거나 외부 URL이 아닌 링크는 null로 정규화한다", () => {
        expect(normalizeExternalUrl("javascript:alert(1)")).toBeNull();
        expect(normalizeExternalUrl("ftp://dongle.kr/file")).toBeNull();
        expect(normalizeExternalUrl("https://user@example.com/schedule")).toBeNull();
        expect(normalizeExternalUrl("localhost:4001/schedule")).toBeNull();
        expect(normalizeExternalUrl("/schedule")).toBeNull();
        expect(normalizeExternalUrl("events/123")).toBeNull();
        expect(normalizeExternalUrl("   ")).toBeNull();
        expect(normalizeExternalUrl(null)).toBeNull();
    });
});

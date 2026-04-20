import { describe, expect, it } from "vitest";
import { normalizeSocialUrl } from "@dongle/ui/utils";

describe("normalizeSocialUrl", () => {
    it("instagram handle을 프로필 URL로 정규화한다", () => {
        expect(normalizeSocialUrl("instagram", "@dongle_official")).toBe("https://www.instagram.com/dongle_official");
    });

    it("instagram 도메인 입력을 https URL로 정규화한다", () => {
        expect(normalizeSocialUrl("instagram", "instagram.com/dongle.official/")).toBe(
            "https://www.instagram.com/dongle.official"
        );
    });

    it("instagram이 아닌 URL은 인스타그램 홈으로 보낸다", () => {
        expect(normalizeSocialUrl("instagram", "https://example.com/dongle")).toBe("https://www.instagram.com/");
    });

    it("youtube handle을 채널 URL로 정규화한다", () => {
        expect(normalizeSocialUrl("youtube", "@dongle")).toBe("https://www.youtube.com/@dongle");
    });

    it("youtube 전체 URL을 정규화한다", () => {
        expect(normalizeSocialUrl("youtube", "youtube.com/watch?v=abc123")).toBe(
            "https://www.youtube.com/watch?v=abc123"
        );
    });

    it("youtube 일반 문자열은 검색 결과 URL로 정규화한다", () => {
        expect(normalizeSocialUrl("youtube", "Dongle Official")).toBe(
            "https://www.youtube.com/results?search_query=Dongle%20Official"
        );
    });

    it("빈 값은 null을 반환한다", () => {
        expect(normalizeSocialUrl("instagram", "  ")).toBeNull();
        expect(normalizeSocialUrl("youtube", null)).toBeNull();
    });
});

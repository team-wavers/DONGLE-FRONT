import { describe, expect, test } from "vitest";
import type { MainBanner } from "@dongle/types/main-banner/main-banner";
import { getDisplayMainBannerItems, normalizeDisplayBannerLinkUrl } from "./get-display-banner-image-urls";

function createBanner(overrides: Partial<MainBanner> = {}): MainBanner {
    return {
        id: 1,
        image_url: "https://cdn.example.com/banner.png",
        link_url: "https://example.com/event",
        publish_start_at: "2026-05-01 00:00:00",
        publish_end_at: "2026-05-31 23:59:59",
        is_active: true,
        created_at: "2026-05-01 00:00:00",
        updated_at: "2026-05-01 00:00:00",
        deleted_at: null,
        ...overrides,
    };
}

describe("getDisplayMainBannerItems", () => {
    test("노출 가능한 배너의 이미지와 정규화된 링크를 반환한다", () => {
        const result = getDisplayMainBannerItems(
            [
                createBanner({ id: 1, link_url: " https://example.com/event " }),
                createBanner({ id: 2, link_url: "/clubs" }),
            ],
            new Date("2026-05-10T12:00:00")
        );

        expect(result).toEqual([
            { imageUrl: "https://cdn.example.com/banner.png", linkUrl: "https://example.com/event" },
            { imageUrl: "https://cdn.example.com/banner.png", linkUrl: "/clubs" },
        ]);
    });

    test("비활성, 이미지 없음, 노출 기간 밖 배너는 제외한다", () => {
        const result = getDisplayMainBannerItems(
            [
                createBanner({ id: 1, is_active: false }),
                createBanner({ id: 2, image_url: " " }),
                createBanner({ id: 3, publish_end_at: "2026-05-09 23:59:59" }),
                createBanner({ id: 4 }),
            ],
            new Date("2026-05-10T12:00:00")
        );

        expect(result).toEqual([
            {
                imageUrl: "https://cdn.example.com/banner.png",
                linkUrl: "https://example.com/event",
            },
        ]);
    });

    test("허용되지 않는 링크는 null로 정규화한다", () => {
        expect(normalizeDisplayBannerLinkUrl("javascript:alert(1)")).toBeNull();
        expect(normalizeDisplayBannerLinkUrl("//example.com/path")).toBeNull();
        expect(normalizeDisplayBannerLinkUrl("ftp://example.com/file")).toBeNull();
        expect(normalizeDisplayBannerLinkUrl("")).toBeNull();
        expect(normalizeDisplayBannerLinkUrl(null)).toBeNull();
    });
});

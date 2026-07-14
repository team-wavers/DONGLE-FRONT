import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";
import ClubDetailSocialInfoLink from "./club-detail-social-info-link";

const analyticsMock = vi.hoisted(() => ({
    trackDongleEvent: vi.fn(),
}));

vi.mock("@/lib/analytics", () => analyticsMock);

describe("ClubDetailSocialInfoLink", () => {
    test("소셜 링크 행을 렌더링한다", () => {
        const html = renderToStaticMarkup(
            <ClubDetailSocialInfoLink
                clubId={1}
                clubName="D-Maker"
                platform="instagram"
                href="https://instagram.com/dmaker"
                label="instagram"
                value="instagram"
            />
        );

        expect(html).toContain('href="https://instagram.com/dmaker"');
        expect(html).toContain("instagram");
        expect(html).toContain('lucide-external-link');
    });

    test("클릭 시 social_link_click 이벤트를 전송한다", () => {
        analyticsMock.trackDongleEvent.mockClear();
        const element = ClubDetailSocialInfoLink({
            clubId: 1,
            clubName: "D-Maker",
            platform: "youtube",
            href: "https://youtube.com/@dmaker",
            label: "youtube",
            value: "youtube",
        });
        const props = element.props as { onClick?: () => void };

        props.onClick?.();

        expect(analyticsMock.trackDongleEvent).toHaveBeenCalledWith("social_link_click", {
            club_id: 1,
            club_name: "D-Maker",
            platform: "youtube",
            destination: "https://youtube.com/@dmaker",
        });
    });
});

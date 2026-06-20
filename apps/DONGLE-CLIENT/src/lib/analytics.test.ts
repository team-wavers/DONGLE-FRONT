import { afterEach, describe, expect, it, vi } from "vitest";
import posthog from "posthog-js";
import {
    getPostHogInitOptions,
    sanitizeDongleAnalyticsProperties,
    trackDongleEvent,
    type DongleAnalyticsEventName,
} from "@/lib/analytics";

vi.mock("posthog-js", () => ({
    default: {
        capture: vi.fn(),
    },
}));

const capture = vi.mocked(posthog.capture);

afterEach(() => {
    capture.mockClear();
    vi.unstubAllGlobals();
});

describe("getPostHogInitOptions", () => {
    it("역방향 프록시 경로와 개인정보 보호 기본 설정을 반환한다", () => {
        expect(getPostHogInitOptions()).toMatchObject({
            api_host: "/ingest",
            ui_host: "https://us.posthog.com",
            autocapture: false,
            defaults: "2026-01-30",
            capture_exceptions: false,
            disable_session_recording: true,
            respect_dnt: true,
        });
    });
});

describe("sanitizeDongleAnalyticsProperties", () => {
    it("이벤트별 허용 필드만 유지한다", () => {
        expect(
            sanitizeDongleAnalyticsProperties("club_card_click", {
                club_id: 12,
                club_name: "동글동아리",
                club_category: "문화",
                destination: "/clubs/12",
                phone: "010-0000-0000",
                search_query: "밴드",
            })
        ).toEqual({
            club_id: 12,
            club_name: "동글동아리",
            club_category: "문화",
        });
    });

    it("정의되지 않은 이벤트는 빈 속성으로 정규화한다", () => {
        expect(
            sanitizeDongleAnalyticsProperties("unknown_event" as DongleAnalyticsEventName, {
                club_id: 12,
            })
        ).toEqual({});
    });
});

describe("trackDongleEvent", () => {
    it("브라우저 환경이 아니면 PostHog capture를 호출하지 않는다", () => {
        trackDongleEvent("social_link_click", {
            club_id: 12,
            club_name: "동글동아리",
            platform: "instagram",
            destination: "https://www.instagram.com/dongle",
        });

        expect(capture).not.toHaveBeenCalled();
    });

    it("브라우저 환경에서는 정규화된 이벤트만 전송한다", () => {
        vi.stubGlobal("window", {});

        trackDongleEvent("schedule_external_link_click", {
            club_id: 12,
            club_name: "동글동아리",
            destination: "https://dongle.kr/schedule",
        });

        expect(capture).toHaveBeenCalledWith("schedule_external_link_click", {
            club_id: 12,
            club_name: "동글동아리",
            destination: "https://dongle.kr/schedule",
        });
    });
});

import posthog from "posthog-js";

export type DongleAnalyticsEventName =
    | "banner_click"
    | "club_card_click"
    | "report_click"
    | "social_link_click"
    | "schedule_external_link_click"
    | "club_tab_change"
    | "club_filter_status_change"
    | "club_filter_category_change"
    | "club_filter_reset";

type DongleAnalyticsProperties = {
    banner_click: {
        destination: string;
    };
    club_card_click: {
        club_id: number;
        club_name: string;
        club_category: string;
    };
    report_click: {
        club_id: number;
        club_name: string;
        report_id: number;
    };
    social_link_click: {
        club_id: number;
        club_name: string;
        platform: "instagram" | "youtube";
        destination: string;
    };
    schedule_external_link_click: {
        club_id: number;
        club_name: string;
        destination: string;
    };
    club_tab_change: {
        club_id: number;
        club_name: string;
        tab_name: "intro" | "reports" | "schedules";
    };
    club_filter_status_change: {
        status: "all" | "recruiting" | "closed";
    };
    club_filter_category_change: {
        category: string;
    };
    club_filter_reset: Record<string, never>;
};

const ALLOWED_PROPERTY_KEYS: Record<DongleAnalyticsEventName, ReadonlyArray<string>> = {
    banner_click: ["destination"],
    club_card_click: ["club_id", "club_name", "club_category"],
    report_click: ["club_id", "club_name", "report_id"],
    social_link_click: ["club_id", "club_name", "platform", "destination"],
    schedule_external_link_click: ["club_id", "club_name", "destination"],
    club_tab_change: ["club_id", "club_name", "tab_name"],
    club_filter_status_change: ["status"],
    club_filter_category_change: ["category"],
    club_filter_reset: [],
};

export function getPostHogInitOptions() {
    return {
        api_host: "/ingest",
        ui_host: "https://us.posthog.com",
        autocapture: false,
        defaults: "2026-01-30" as const,
        capture_exceptions: true,
        disable_session_recording: true,
        respect_dnt: true,
        debug: process.env.NODE_ENV === "development",
    };
}

export function sanitizeDongleAnalyticsProperties(
    eventName: DongleAnalyticsEventName,
    properties: Record<string, unknown> = {}
) {
    const allowedKeys = ALLOWED_PROPERTY_KEYS[eventName];
    if (!allowedKeys) {
        return {};
    }

    return allowedKeys.reduce<Record<string, unknown>>((safeProperties, key) => {
        if (properties[key] !== undefined) {
            safeProperties[key] = properties[key];
        }

        return safeProperties;
    }, {});
}

export function trackDongleEvent<EventName extends DongleAnalyticsEventName>(
    eventName: EventName,
    properties: DongleAnalyticsProperties[EventName]
) {
    if (typeof window === "undefined") {
        return;
    }

    posthog.capture(eventName, sanitizeDongleAnalyticsProperties(eventName, properties));
}

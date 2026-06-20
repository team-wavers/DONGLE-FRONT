import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import ClubDetailTabs from "./club-detail-tabs";

vi.mock("@dongle/ui/tabs", async () => {
    const React = await import("react");
    const Passthrough = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
    const Trigger = ({ children }: { children: React.ReactNode }) => <button>{children}</button>;

    return {
        Tabs: Passthrough,
        TabsContent: Passthrough,
        TabsList: Passthrough,
        TabsTrigger: Trigger,
    };
});

vi.mock("@/lib/analytics", () => ({
    trackDongleEvent: vi.fn(),
}));

describe("ClubDetailTabs", () => {
    it("활동보고서와 일정 탭은 서버에서 전달한 content slot을 렌더링한다", () => {
        const html = renderToStaticMarkup(
            <ClubDetailTabs
                club={{
                    description: "<p>소개</p>",
                    main_activities: "<p>활동</p>",
                }}
                clubId="12"
                clubName="동글동아리"
                reportsContent={<div>reports-slot</div>}
                schedulesContent={<div>schedules-slot</div>}
            />
        );

        expect(html).toContain("동아리 소개");
        expect(html).toContain("동아리 활동보고서");
        expect(html).toContain("일정");
        expect(html).toContain("reports-slot");
        expect(html).toContain("schedules-slot");
    });
});

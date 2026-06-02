import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { ClubPublicSchedule } from "@/lib/club-schedule.types";
import PublicScheduleCalendar from "./public-schedule-calendar";

vi.mock("@/lib/analytics", () => ({
    trackDongleEvent: vi.fn(),
}));

const schedules: ClubPublicSchedule[] = [
    {
        id: 1,
        clubId: null,
        clubName: "총동아리연합회",
        category: "총동아리연합회",
        title: "공통 행사",
        type: "event",
        start_at: "2026-06-10T01:00:00.000Z",
        end_at: "2026-06-10T03:00:00.000Z",
        is_public: true,
        location: "중앙광장",
        description: "전체 대상 행사",
        external_url: null,
    },
    {
        id: 2,
        clubId: 12,
        clubName: "UCDC",
        category: "학술분과",
        title: "동아리 행사",
        type: "regular_meeting",
        start_at: "2026-06-12T10:00:00.000Z",
        end_at: "2026-06-12T12:00:00.000Z",
        is_public: true,
        location: "강의실",
        description: "동아리 대상 행사",
        external_url: null,
    },
];

describe("PublicScheduleCalendar", () => {
    it("공통 일정과 동아리 일정을 캘린더와 월별 목록에 렌더링한다", () => {
        const html = renderToStaticMarkup(<PublicScheduleCalendar schedules={schedules} visibleMonthKey="2026-06" />);

        expect(html).toContain("전체 일정");
        expect(html).not.toContain(">SCHEDULE<");
        expect(html).toContain("공통 행사");
        expect(html).toContain("총동아리연합회");
        expect(html).toContain("동아리 행사");
        expect(html).toContain("UCDC");
        expect(html).toContain("/schedules?month=2026-05");
        expect(html).toContain("/schedules?month=2026-07");
    });

    it("전체 일정 조회 실패 상태는 일정 없음 문구 대신 실패 안내를 렌더링한다", () => {
        const html = renderToStaticMarkup(
            <PublicScheduleCalendar schedules={[]} visibleMonthKey="2026-06" loadFailed />
        );

        expect(html).toContain("전체 일정을 불러오지 못했습니다. 잠시 후 다시 확인해주세요.");
        expect(html).toContain("일정을 불러오지 못했습니다. 잠시 후 다시 확인해주세요.");
        expect(html).not.toContain("이 달에 등록된 공개 일정이 없습니다.");
    });
});

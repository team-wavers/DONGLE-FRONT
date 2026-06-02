import { describe, expect, it } from "vitest";
import type { AdminClubSchedule } from "@dongle/types/club/club.schedule";
import {
    getPublicScheduleCalendarDates,
    getPublicScheduleMonthKey,
    getPublicScheduleMonthQuery,
    getPublicSchedulesForDate,
    mapPublicCalendarScheduleToPublicSchedule,
    mapPublicScheduleToDisplayItem,
} from "./public-schedule-calendar";

function getLocalDateKey(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

const commonSchedule = {
    id: 9,
    club_id: null,
    title: "공통 행사",
    type: "event",
    start_at: "2026-06-10T01:00:00.000Z",
    end_at: "2026-06-10T03:00:00.000Z",
    is_public: true,
    location: null,
    description: null,
    external_url: null,
    created_at: "2026-06-01T00:00:00.000Z",
    updated_at: "2026-06-01T00:00:00.000Z",
    deleted_at: null,
    club: null,
} satisfies AdminClubSchedule;

const clubSchedule = {
    ...commonSchedule,
    id: 10,
    club_id: 12,
    title: "동아리 행사",
    club: {
        id: 12,
        name: "UCDC",
        category: "학술분과",
    },
} satisfies AdminClubSchedule;

describe("public schedule calendar", () => {
    it("월 key와 월간 조회 query를 만든다", () => {
        expect(getPublicScheduleMonthKey("2026-06")).toBe("2026-06");
        expect(getPublicScheduleMonthKey("invalid")).toMatch(/^\d{4}-\d{2}$/);
        expect(getPublicScheduleMonthQuery("2026-06")).toEqual({
            from: "2026-06-01 00:00:00",
            to: "2026-06-30 23:59:59",
        });
    });

    it("월간 캘린더에 필요한 6주 날짜를 반환한다", () => {
        const dates = getPublicScheduleCalendarDates("2026-06");

        expect(dates).toHaveLength(42);
        expect(getLocalDateKey(dates[0])).toBe("2026-05-31");
        expect(getLocalDateKey(dates[41])).toBe("2026-07-11");
    });

    it("공통 일정은 clubId null과 총동연 라벨을 유지한다", () => {
        const schedule = mapPublicCalendarScheduleToPublicSchedule(commonSchedule);
        const item = mapPublicScheduleToDisplayItem(schedule);

        expect(schedule).toMatchObject({
            clubId: null,
            clubName: "총동아리연합회",
            category: "총동아리연합회",
        });
        expect(item).toMatchObject({
            clubName: "총동아리연합회",
            category: "총동아리연합회",
        });
    });

    it("동아리 일정은 응답의 동아리 정보를 표시용 라벨로 유지한다", () => {
        expect(mapPublicCalendarScheduleToPublicSchedule(clubSchedule)).toMatchObject({
            clubId: 12,
            clubName: "UCDC",
            category: "학술분과",
        });
    });

    it("선택 날짜와 기간이 겹치는 공개 일정을 시작일시 순으로 반환한다", () => {
        const schedules = [
            mapPublicCalendarScheduleToPublicSchedule({
                ...clubSchedule,
                id: 11,
                title: "늦은 일정",
                start_at: "2026-06-10T05:00:00.000Z",
                end_at: "2026-06-10T06:00:00.000Z",
            }),
            mapPublicCalendarScheduleToPublicSchedule({
                ...commonSchedule,
                id: 12,
                title: "걸친 일정",
                start_at: "2026-06-09T15:00:00.000Z",
                end_at: "2026-06-10T02:00:00.000Z",
            }),
        ];

        expect(getPublicSchedulesForDate(schedules, new Date(2026, 5, 10)).map((schedule) => schedule.title)).toEqual([
            "걸친 일정",
            "늦은 일정",
        ]);
    });
});

import { describe, expect, it } from "vitest";
import type { ClubSchedule } from "@dongle/types/club/club.schedule";
import {
    formatScheduleDateTime,
    formatScheduleDateTimeRange,
    getClubScheduleGroups,
    mapClubScheduleToPublicSchedule,
} from "./club-schedule";
import type { ClubPublicSchedule } from "./club-schedule.types";

const schedules: ClubPublicSchedule[] = [
    {
        id: 1,
        clubId: 12,
        title: "지난 공개 일정",
        type: "event",
        start_at: "2026-05-01T10:00:00.000Z",
        end_at: "2026-05-01T12:00:00.000Z",
        is_public: true,
        location: "학생회관",
        description: "지난 일정입니다.",
        external_url: null,
    },
    {
        id: 2,
        clubId: 12,
        title: "비공개 일정",
        type: "event",
        start_at: "2026-05-18T10:00:00.000Z",
        end_at: "2026-05-18T11:00:00.000Z",
        is_public: false,
        location: "동아리방",
        description: "사용자에게 노출되지 않습니다.",
        external_url: null,
    },
    {
        id: 3,
        clubId: 12,
        title: "나중 공개 일정",
        type: "regular_meeting",
        start_at: "2026-05-22T19:00:00.000Z",
        end_at: "2026-05-22T21:00:00.000Z",
        is_public: true,
        location: "강의실",
        description: "정기 모임입니다.",
        external_url: "https://example.com/meeting",
    },
    {
        id: 4,
        clubId: 8,
        title: "다른 동아리 일정",
        type: "recruitment",
        start_at: "2026-05-16T10:00:00.000Z",
        end_at: "2026-05-16T12:00:00.000Z",
        is_public: true,
        location: "운동장",
        description: "다른 동아리 일정입니다.",
        external_url: null,
    },
    {
        id: 5,
        clubId: 12,
        title: "먼저 공개 일정",
        type: "event",
        start_at: "2026-05-16T10:00:00.000Z",
        end_at: "2026-05-16T12:00:00.000Z",
        is_public: true,
        location: "체육관",
        description: "가장 가까운 일정입니다.",
        external_url: null,
    },
];

describe("club schedule", () => {
    it("해당 동아리의 공개 일정만 다가오는 일정과 지난 일정으로 분리해 시작일시 오름차순 정렬한다", () => {
        const groups = getClubScheduleGroups(schedules, {
            clubId: 12,
            now: new Date("2026-05-15T00:00:00.000Z"),
        });

        expect(groups.upcoming.map((schedule) => schedule.title)).toEqual(["먼저 공개 일정", "나중 공개 일정"]);
        expect(groups.past.map((schedule) => schedule.title)).toEqual(["지난 공개 일정"]);
    });

    it("백엔드 공개 일정 응답을 화면 일정 모델로 변환하고 외부 링크를 정규화한다", () => {
        const schedule: ClubSchedule = {
            id: 7,
            club_id: 12,
            title: "정기 모임",
            type: "regular_meeting",
            start_at: "2026-05-18T10:00:00.000Z",
            end_at: "2026-05-18T12:00:00.000Z",
            is_public: true,
            location: null,
            description: null,
            external_url: "dongle.kr/meeting",
            created_at: "2026-05-01T00:00:00.000Z",
            updated_at: "2026-05-01T00:00:00.000Z",
            deleted_at: null,
        };

        expect(mapClubScheduleToPublicSchedule(schedule)).toEqual({
            id: 7,
            clubId: 12,
            title: "정기 모임",
            type: "regular_meeting",
            start_at: "2026-05-18T10:00:00.000Z",
            end_at: "2026-05-18T12:00:00.000Z",
            is_public: true,
            location: "",
            description: "",
            external_url: "https://dongle.kr/meeting",
        });
    });

    it("백엔드 공개 일정 응답의 잘못된 외부 링크는 화면 모델에서 제거한다", () => {
        const schedule: ClubSchedule = {
            id: 8,
            club_id: 12,
            title: "외부 링크 오류 일정",
            type: "event",
            start_at: "2026-05-18T10:00:00.000Z",
            end_at: "2026-05-18T12:00:00.000Z",
            is_public: true,
            location: null,
            description: null,
            external_url: "javascript:alert(1)",
            created_at: "2026-05-01T00:00:00.000Z",
            updated_at: "2026-05-01T00:00:00.000Z",
            deleted_at: null,
        };

        expect(mapClubScheduleToPublicSchedule(schedule).external_url).toBeNull();
    });

    it("일정 날짜시간은 방문자 로컬 시간대가 아니라 Seoul 기준으로 표시한다", () => {
        expect(formatScheduleDateTime("2026-05-20T10:00:00.000Z")).toBe("05.20 19:00");
    });

    it("같은 날 일정 기간은 종료 날짜를 반복하지 않고 표시한다", () => {
        expect(formatScheduleDateTimeRange("2026-05-20T10:00:00.000Z", "2026-05-20T12:00:00.000Z")).toBe(
            "05.20 19:00 - 21:00"
        );
    });

    it("서로 다른 날 일정 기간은 시작과 종료 날짜를 모두 표시한다", () => {
        expect(formatScheduleDateTimeRange("2026-05-19T01:23:00.000Z", "2026-05-22T01:23:00.000Z")).toBe(
            "05.19 10:23 - 05.22 10:23"
        );
    });
});

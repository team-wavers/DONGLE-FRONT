import { describe, expect, it } from "vitest";
import type { ClubSchedule } from "@dongle/types/club/club.schedule";
import {
    formatScheduleDateRange,
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
        start_at: "2026-05-14T21:00:00.000Z",
        end_at: "2026-05-14T23:00:00.000Z",
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
    {
        id: 6,
        clubId: 12,
        title: "진행 중 공개 일정",
        type: "event",
        start_at: "2026-05-14T23:00:00.000Z",
        end_at: "2026-05-15T01:00:00.000Z",
        is_public: true,
        location: "학생회관",
        description: "아직 종료되지 않은 일정입니다.",
        external_url: null,
    },
];

describe("club schedule", () => {
    it("해당 동아리의 공개 일정은 진행 중을 따로 분리하고 나머지는 현재와 가까운 순으로 정렬한다", () => {
        const groups = getClubScheduleGroups(schedules, {
            clubId: 12,
            now: new Date("2026-05-15T00:00:00.000Z"),
        });

        expect(groups.ongoing.map((schedule) => schedule.title)).toEqual(["진행 중 공개 일정"]);
        expect(groups.upcoming.map((schedule) => schedule.title)).toEqual(["먼저 공개 일정", "나중 공개 일정"]);
        expect(groups.past.map((schedule) => schedule.title)).toEqual(["지난 공개 일정"]);
        expect(groups.remaining?.map((schedule) => schedule.title)).toEqual([
            "지난 공개 일정",
            "먼저 공개 일정",
            "나중 공개 일정",
        ]);
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
        expect(formatScheduleDateTime("2026-05-20T10:00:00.000Z")).toBe("5월 20일 19시 00분");
    });

    it("일정 날짜시간이 00시 00분이면 시간을 생략한다", () => {
        expect(formatScheduleDateTime("2026-05-19T15:00:00.000Z")).toBe("5월 20일");
    });

    it("같은 날 일정 기간은 종료 날짜를 반복하지 않고 표시한다", () => {
        expect(formatScheduleDateTimeRange("2026-05-20T10:00:00.000Z", "2026-05-20T12:00:00.000Z")).toBe(
            "5월 20일 19시 00분 - 21시 00분"
        );
    });

    it("같은 날 일정 기간의 시작 또는 종료가 00시 00분이면 해당 시간을 생략한다", () => {
        expect(formatScheduleDateTimeRange("2026-05-19T15:00:00.000Z", "2026-05-20T12:00:00.000Z")).toBe(
            "5월 20일 - 21시 00분"
        );
        expect(formatScheduleDateTimeRange("2026-05-20T10:00:00.000Z", "2026-05-20T15:00:00.000Z")).toBe(
            "5월 20일 19시 00분 - 5월 21일"
        );
    });

    it("모바일 일정 기간은 시간 없이 날짜 범위만 표시한다", () => {
        expect(formatScheduleDateRange("2026-05-20T10:00:00.000Z", "2026-05-20T12:00:00.000Z")).toBe("5월 20일");
        expect(formatScheduleDateRange("2026-05-19T01:23:00.000Z", "2026-05-22T01:23:00.000Z")).toBe(
            "5월 19일 - 5월 22일"
        );
    });

    it("서로 다른 날 일정 기간은 시작과 종료 날짜를 모두 표시한다", () => {
        expect(formatScheduleDateTimeRange("2026-05-19T01:23:00.000Z", "2026-05-22T01:23:00.000Z")).toBe(
            "5월 19일 10시 23분 - 5월 22일 10시 23분"
        );
    });
});

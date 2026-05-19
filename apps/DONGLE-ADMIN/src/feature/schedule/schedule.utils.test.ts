import { describe, expect, it } from "vitest";
import type { AdminClubSchedule, ClubSchedule as ApiClubSchedule } from "@dongle/types/club/club.schedule";
import type { ClubSchedule } from "./schedule.types";
import {
    buildClubSchedulePayload,
    filterSchedules,
    formatScheduleDateTime,
    formatScheduleTime,
    getMonthCalendarDates,
    getMonthScheduleQuery,
    getSchedulesForDate,
    mapAdminClubScheduleToClubSchedule,
    mapClubScheduleToClubSchedule,
    sortSchedulesByStartAt,
} from "./schedule.utils";

const SCHEDULES: ClubSchedule[] = [
    {
        id: 1,
        clubId: 12,
        clubName: "스파이크",
        category: "체육분과",
        title: "신입 부원 오리엔테이션",
        type: "recruitment",
        startsAt: "2026-05-20T18:00:00",
        endsAt: "2026-05-20T20:00:00",
        isPublic: true,
        location: "학생회관 302호",
        description: "신입 부원 대상 활동 소개와 팀 배정 안내를 진행합니다.",
    },
    {
        id: 3,
        clubId: 4,
        clubName: "하늘",
        category: "문예분과",
        title: "봄 전시회",
        type: "event",
        startsAt: "2026-05-24T13:00:00",
        endsAt: "2026-05-24T17:00:00",
        isPublic: true,
        location: "중앙도서관 로비",
        description: "동아리 작품 전시와 현장 투표를 진행합니다.",
        externalUrl: "https://example.com/exhibition",
    },
    {
        id: 5,
        clubId: 22,
        clubName: "UCDC",
        category: "음악분과",
        title: "공개 댄스 워크숍",
        type: "event",
        startsAt: "2026-06-03T18:00:00",
        endsAt: "2026-06-03T20:30:00",
        isPublic: true,
        location: "체육관 다목적실",
        description: "초보자도 참여 가능한 공개 워크숍입니다.",
    },
    {
        id: 6,
        clubId: 15,
        clubName: "봉동이",
        category: "봉사분과",
        title: "지역 환경 정화 봉사",
        type: "event",
        startsAt: "2026-06-06T09:00:00",
        endsAt: "2026-06-06T12:00:00",
        isPublic: true,
        location: "순천만 일대",
        description: "지역 연계 환경 정화 봉사 활동입니다.",
    },
];

function formatLocalDate(date: Date) {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${date.getFullYear()}-${month}-${day}`;
}

describe("schedule utils", () => {
    it("월간 캘린더에 필요한 6주 날짜를 반환한다", () => {
        const dates = getMonthCalendarDates(2026, 4);

        expect(dates).toHaveLength(42);
        expect(formatLocalDate(dates[0])).toBe("2026-04-26");
        expect(formatLocalDate(dates[41])).toBe("2026-06-06");
    });

    it("월간 일정 조회 query는 Seoul 기준 서버 요청 문자열로 반환한다", () => {
        expect(getMonthScheduleQuery(new Date("2026-05-18T12:00:00.000Z"))).toEqual({
            from: "2026-05-01 00:00:00",
            to: "2026-05-31 23:59:59",
        });
    });

    it("선택한 날짜의 일정을 Seoul 기준으로 찾는다", () => {
        const schedules = getSchedulesForDate(
            [
                ...SCHEDULES,
                {
                    ...SCHEDULES[0],
                    id: 99,
                    title: "Seoul 자정 일정",
                    startsAt: "2026-05-20T15:30:00.000Z",
                },
            ],
            new Date("2026-05-21T00:00:00+09:00")
        );

        expect(schedules.map((schedule) => schedule.title)).toEqual(["Seoul 자정 일정"]);
    });

    it("키워드와 상태 필터를 함께 적용한다", () => {
        const schedules = filterSchedules(SCHEDULES, {
            keyword: "음악",
            category: "음악분과",
            type: "all",
            isPublic: true,
        });

        expect(schedules.map((schedule) => schedule.clubName)).toEqual(["UCDC"]);
    });

    it("일정을 시작일시 오름차순으로 정렬한다", () => {
        const schedules = sortSchedulesByStartAt([SCHEDULES[3], SCHEDULES[0], SCHEDULES[1]]);

        expect(schedules.map((schedule) => schedule.id)).toEqual([1, 3, 6]);
    });

    it("관리자 일정 응답을 화면 일정 모델로 변환한다", () => {
        const schedule: AdminClubSchedule = {
            id: 7,
            club_id: 3,
            title: "정기 세미나",
            type: "regular_meeting",
            start_at: "2026-05-18T10:00:00.000Z",
            end_at: "2026-05-18T12:00:00.000Z",
            is_public: false,
            location: null,
            description: null,
            external_url: null,
            created_at: "2026-05-01T00:00:00.000Z",
            updated_at: "2026-05-01T00:00:00.000Z",
            deleted_at: null,
            club: {
                id: 999,
                name: "UCDC",
                category: "학술분과",
            },
        };

        expect(mapAdminClubScheduleToClubSchedule(schedule)).toEqual({
            id: 7,
            clubId: 3,
            clubName: "UCDC",
            category: "학술분과",
            title: "정기 세미나",
            type: "regular_meeting",
            startsAt: "2026-05-18T10:00:00.000Z",
            endsAt: "2026-05-18T12:00:00.000Z",
            isPublic: false,
            location: "",
            description: "",
            externalUrl: undefined,
        });
    });

    it("회장 일정 응답은 응답의 club_id를 화면 일정 clubId로 변환한다", () => {
        const schedule: ApiClubSchedule = {
            id: 8,
            club_id: 12,
            title: "회장 등록 일정",
            type: "event",
            start_at: "2026-06-01T10:00:00.000Z",
            end_at: "2026-06-01T12:00:00.000Z",
            is_public: true,
            location: null,
            description: null,
            external_url: null,
            created_at: "2026-05-01T00:00:00.000Z",
            updated_at: "2026-05-01T00:00:00.000Z",
            deleted_at: null,
        };

        expect(mapClubScheduleToClubSchedule(schedule)).toMatchObject({
            id: 8,
            clubId: 12,
            clubName: "",
            category: "",
            title: "회장 등록 일정",
            location: "",
            description: "",
            externalUrl: undefined,
        });
    });

    it("일정 날짜시간은 Seoul 기준으로 표시한다", () => {
        expect(formatScheduleDateTime("2026-05-20T15:30:00.000Z")).toBe("2026.05.21 00:30");
        expect(formatScheduleTime("2026-05-20T15:30:00.000Z")).toBe("00:30");
    });

    it("회장 일정 저장 payload는 빈 optional 문자열을 null이 아닌 빈 문자열로 보낸다", () => {
        expect(
            buildClubSchedulePayload({
                title: " CMUX 일정 ",
                type: "event",
                startsAt: "2026-06-16T20:00",
                endsAt: "2026-06-16T22:00",
                isPublic: false,
                location: "  ",
                description: null,
                externalUrl: undefined,
            })
        ).toEqual({
            title: "CMUX 일정",
            type: "event",
            start_at: "2026-06-16 20:00:00",
            end_at: "2026-06-16 22:00:00",
            is_public: false,
            location: "",
            description: "",
            external_url: "",
        });
    });
});

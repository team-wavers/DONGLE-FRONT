import { describe, expect, it } from "vitest";
import type { AdminClubSchedule, ClubSchedule as ApiClubSchedule } from "@dongle/types/club/club.schedule";
import type { ClubSchedule } from "./schedule.types";
import {
    buildClubSchedulePayload,
    filterSchedules,
    formatScheduleDateBadge,
    formatScheduleDateTime,
    formatScheduleDateTimeRange,
    formatScheduleTime,
    groupSchedulesByMonth,
    getMonthScheduleQueryByMonthKey,
    getScheduleDescriptionLabel,
    getScheduleExternalUrlError,
    getScheduleLocationLabel,
    getScheduleMetaText,
    getScheduleMonthKey,
    getMonthCalendarDates,
    getMonthScheduleQuery,
    getScheduleDateRangeFilter,
    parseScheduleMonthKey,
    getSchedulesForDate,
    getSeparatedScheduleGroups,
    isScheduleOngoing,
    isSchedulePast,
    isScheduleUpcoming,
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

    it("월 key 기반 일정 조회 query는 클라이언트 timezone과 무관한 서버 요청 문자열을 반환한다", () => {
        expect(getMonthScheduleQueryByMonthKey("2026-05")).toEqual({
            from: "2026-05-01 00:00:00",
            to: "2026-05-31 23:59:59",
        });
    });

    it("월 상태 key는 Seoul 기준 월을 timezone 없는 로컬 월 Date로 복원한다", () => {
        const monthKey = getScheduleMonthKey(new Date("2026-05-01T00:30:00.000Z"));

        expect(monthKey).toBe("2026-05");
        expect(parseScheduleMonthKey(monthKey)).toEqual(new Date(2026, 4, 1));
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
                    endsAt: "2026-05-20T16:30:00.000Z",
                },
            ],
            new Date("2026-05-21T00:00:00+09:00")
        );

        expect(schedules.map((schedule) => schedule.title)).toEqual(["Seoul 자정 일정"]);
    });

    it("선택한 날짜가 일정 시작일과 종료일 사이에 포함되면 해당 일정을 찾는다", () => {
        const multiDaySchedule: ClubSchedule = {
            ...SCHEDULES[0],
            id: 100,
            title: "3일간 진행되는 축제",
            startsAt: "2026-05-20T10:00:00.000Z",
            endsAt: "2026-05-22T12:00:00.000Z",
        };

        expect(getSchedulesForDate([multiDaySchedule], new Date("2026-05-20T00:00:00+09:00"))).toEqual([
            multiDaySchedule,
        ]);
        expect(getSchedulesForDate([multiDaySchedule], new Date("2026-05-21T00:00:00+09:00"))).toEqual([
            multiDaySchedule,
        ]);
        expect(getSchedulesForDate([multiDaySchedule], new Date("2026-05-22T00:00:00+09:00"))).toEqual([
            multiDaySchedule,
        ]);
        expect(getSchedulesForDate([multiDaySchedule], new Date("2026-05-23T00:00:00+09:00"))).toEqual([]);
    });

    it("키워드와 상태 필터를 함께 적용한다", () => {
        const schedules = filterSchedules(SCHEDULES, {
            keyword: "음악",
            category: "음악분과",
            type: "all",
            isPublic: true,
            status: "all",
            now: new Date("2026-05-20T19:00:00"),
        });

        expect(schedules.map((schedule) => schedule.clubName)).toEqual(["UCDC"]);
    });

    it("일정 상태 필터는 시작 전, 진행 중, 종료 후 일정을 구분한다", () => {
        const schedules: ClubSchedule[] = [
            {
                ...SCHEDULES[0],
                id: 10,
                title: "종료된 일정",
                startsAt: "2026-05-20T16:00:00",
                endsAt: "2026-05-20T18:00:00",
            },
            {
                ...SCHEDULES[0],
                id: 11,
                title: "진행 중인 일정",
                startsAt: "2026-05-20T18:00:00",
                endsAt: "2026-05-20T20:00:00",
            },
            {
                ...SCHEDULES[0],
                id: 12,
                title: "다가오는 일정",
                startsAt: "2026-05-20T20:00:00",
                endsAt: "2026-05-20T21:00:00",
            },
        ];
        const baseFilters = {
            keyword: "",
            category: "all",
            type: "all" as const,
            isPublic: "all" as const,
            now: new Date("2026-05-20T19:00:00"),
        };

        expect(filterSchedules(schedules, { ...baseFilters, status: "past" }).map((schedule) => schedule.id)).toEqual([
            10,
        ]);
        expect(filterSchedules(schedules, { ...baseFilters, status: "ongoing" }).map((schedule) => schedule.id)).toEqual([
            11,
        ]);
        expect(filterSchedules(schedules, { ...baseFilters, status: "upcoming" }).map((schedule) => schedule.id)).toEqual([
            12,
        ]);
    });

    it("공개 상태와 날짜 범위 필터를 함께 적용한다", () => {
        const schedules: ClubSchedule[] = [
            {
                ...SCHEDULES[0],
                id: 20,
                title: "비공개 5월 일정",
                startsAt: "2026-05-21T18:00:00",
                endsAt: "2026-05-21T20:00:00",
                isPublic: false,
            },
            {
                ...SCHEDULES[0],
                id: 21,
                title: "공개 5월 일정",
                startsAt: "2026-05-21T18:00:00",
                endsAt: "2026-05-21T20:00:00",
                isPublic: true,
            },
            {
                ...SCHEDULES[0],
                id: 22,
                title: "비공개 6월 일정",
                startsAt: "2026-06-01T18:00:00",
                endsAt: "2026-06-01T20:00:00",
                isPublic: false,
            },
        ];

        const filtered = filterSchedules(schedules, {
            keyword: "",
            category: "all",
            type: "all",
            isPublic: false,
            status: "all",
            now: new Date("2026-05-20T19:00:00"),
            dateRange: { from: "2026-05-01", to: "2026-05-31" },
        });

        expect(filtered.map((schedule) => schedule.id)).toEqual([20]);
    });

    it("여러 날 일정은 선택 날짜 범위와 겹치면 포함한다", () => {
        const multiDaySchedule: ClubSchedule = {
            ...SCHEDULES[0],
            id: 23,
            startsAt: "2026-05-20T18:00:00",
            endsAt: "2026-05-22T10:00:00",
        };

        expect(
            filterSchedules([multiDaySchedule], {
                keyword: "",
                category: "all",
                type: "all",
                isPublic: "all",
                status: "all",
                now: new Date("2026-05-20T19:00:00"),
                dateRange: { from: "2026-05-21", to: "2026-05-21" },
            }).map((schedule) => schedule.id)
        ).toEqual([23]);
        expect(
            filterSchedules([multiDaySchedule], {
                keyword: "",
                category: "all",
                type: "all",
                isPublic: "all",
                status: "all",
                now: new Date("2026-05-20T19:00:00"),
                dateRange: { from: "2026-05-23", to: "2026-05-23" },
            })
        ).toEqual([]);
    });

    it("Date preset은 Seoul 기준 날짜 범위를 반환한다", () => {
        const now = new Date("2026-05-31T16:30:00.000Z");

        expect(getScheduleDateRangeFilter("today", now)).toEqual({
            from: "2026-06-01",
            to: "2026-06-01",
        });
        expect(getScheduleDateRangeFilter("thisWeek", now)).toEqual({
            from: "2026-06-01",
            to: "2026-06-07",
        });
        expect(getScheduleDateRangeFilter("thisMonth", now)).toEqual({
            from: "2026-06-01",
            to: "2026-06-30",
        });
    });

    it("일정을 시작일시 오름차순으로 정렬한다", () => {
        const schedules = sortSchedulesByStartAt([SCHEDULES[3], SCHEDULES[0], SCHEDULES[1]]);

        expect(schedules.map((schedule) => schedule.id)).toEqual([1, 3, 6]);
    });

    it("일정 상태는 현재 시각과 시작/종료일시 기준으로 판단한다", () => {
        const now = new Date("2026-05-20T19:00:00");
        const ongoingSchedule: ClubSchedule = {
            ...SCHEDULES[0],
            startsAt: "2026-05-20T18:00:00",
            endsAt: "2026-05-20T20:00:00",
        };
        const upcomingSchedule: ClubSchedule = {
            ...SCHEDULES[0],
            startsAt: "2026-05-20T20:00:00",
            endsAt: "2026-05-20T21:00:00",
        };
        const endedSchedule: ClubSchedule = {
            ...SCHEDULES[0],
            startsAt: "2026-05-20T16:00:00",
            endsAt: "2026-05-20T18:00:00",
        };

        expect(isScheduleOngoing(ongoingSchedule, now)).toBe(true);
        expect(isScheduleUpcoming(upcomingSchedule, now)).toBe(true);
        expect(isSchedulePast(ongoingSchedule, now)).toBe(false);
        expect(isSchedulePast(endedSchedule, now)).toBe(true);
    });

    it("timezone 없는 일정 상태는 Seoul 로컬 시각 기준으로 판단한다", () => {
        const now = new Date("2026-05-20T09:30:00.000Z");
        const schedule: ClubSchedule = {
            ...SCHEDULES[0],
            startsAt: "2026-05-20 18:00:00",
            endsAt: "2026-05-20 20:00:00",
        };

        expect(isScheduleOngoing(schedule, now)).toBe(true);
        expect(isScheduleUpcoming(schedule, now)).toBe(false);
        expect(isSchedulePast(schedule, now)).toBe(false);
    });

    it("진행 중 일정은 별도 분리하고 나머지는 현재와 가까운 순으로 정렬한다", () => {
        const now = new Date("2026-05-20T19:00:00");
        const schedules: ClubSchedule[] = [
            {
                ...SCHEDULES[0],
                id: 30,
                title: "먼 미래 일정",
                startsAt: "2026-06-01T10:00:00",
                endsAt: "2026-06-01T12:00:00",
            },
            {
                ...SCHEDULES[0],
                id: 31,
                title: "최근 종료 일정",
                startsAt: "2026-05-20T16:00:00",
                endsAt: "2026-05-20T18:00:00",
            },
            {
                ...SCHEDULES[0],
                id: 32,
                title: "곧 시작 일정",
                startsAt: "2026-05-20T20:00:00",
                endsAt: "2026-05-20T21:00:00",
            },
            {
                ...SCHEDULES[0],
                id: 33,
                title: "진행 중 일정",
                startsAt: "2026-05-20T18:00:00",
                endsAt: "2026-05-20T20:00:00",
            },
        ];

        const groups = getSeparatedScheduleGroups(schedules, now);

        expect(groups.ongoing.map((schedule) => schedule.title)).toEqual(["진행 중 일정"]);
        expect(groups.remaining.map((schedule) => schedule.title)).toEqual([
            "곧 시작 일정",
            "최근 종료 일정",
            "먼 미래 일정",
        ]);
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

    it("같은 날 일정 기간은 종료 날짜를 반복하지 않고 표시한다", () => {
        expect(formatScheduleDateTimeRange("2026-05-20T09:00:00.000Z", "2026-05-20T11:30:00.000Z")).toBe(
            "2026.05.20 18:00 - 20:30"
        );
    });

    it("서로 다른 날 일정 기간은 시작과 종료 날짜를 모두 표시한다", () => {
        expect(formatScheduleDateTimeRange("2026-05-19T01:23:00.000Z", "2026-05-22T01:23:00.000Z")).toBe(
            "2026.05.19 10:23 - 2026.05.22 10:23"
        );
    });

    it("일정 목록용 날짜 배지는 Seoul 기준 월, 일, 요일로 나눈다", () => {
        expect(formatScheduleDateBadge("2026-05-20T15:30:00.000Z")).toEqual({
            month: "5월",
            day: "21",
            weekday: "목",
        });
    });

    it("일정을 Seoul 기준 시작 월별로 정렬해 그룹화한다", () => {
        const groups = groupSchedulesByMonth([SCHEDULES[2], SCHEDULES[0], SCHEDULES[1], SCHEDULES[3]]);

        expect(groups).toEqual([
            {
                key: "2026-05",
                label: "2026년 5월",
                schedules: [SCHEDULES[0], SCHEDULES[1]],
            },
            {
                key: "2026-06",
                label: "2026년 6월",
                schedules: [SCHEDULES[2], SCHEDULES[3]],
            },
        ]);
    });

    it("잘못된 일정 기간은 fallback 문구로 표시한다", () => {
        expect(formatScheduleDateTimeRange("", "2026-05-22T01:23:00.000Z")).toBe("-");
        expect(formatScheduleDateTimeRange("2026-05-19T01:23:00.000Z", "")).toBe("-");
        expect(formatScheduleDateBadge("")).toEqual({ month: "-", day: "-", weekday: "-" });
    });

    it("빈 장소, 설명, 목록 메타 문자열은 안전한 화면 문구로 정규화한다", () => {
        expect(getScheduleLocationLabel("  ")).toBe("장소 미정");
        expect(getScheduleDescriptionLabel("")).toBe("설명이 없습니다.");
        expect(getScheduleMetaText(["스파이크", "체육분과", ""])).toBe("스파이크 · 체육분과");
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

    it("회장 일정 저장 payload는 외부 링크를 공통 URL 파서로 정규화한다", () => {
        expect(
            buildClubSchedulePayload({
                title: " CMUX 일정 ",
                type: "event",
                startsAt: "2026-06-16T20:00",
                endsAt: "2026-06-16T22:00",
                isPublic: true,
                location: "",
                description: "",
                externalUrl: " dongle.kr/schedule ",
            }).external_url
        ).toBe("https://dongle.kr/schedule");

        expect(() =>
            buildClubSchedulePayload({
                title: " CMUX 일정 ",
                type: "event",
                startsAt: "2026-06-16T20:00",
                endsAt: "2026-06-16T22:00",
                isPublic: true,
                location: "",
                description: "",
                externalUrl: "javascript:alert(1)",
            })
        ).toThrow("외부 링크는 http 또는 https URL로 입력해주세요.");
    });

    it("회장 일정 외부 링크는 입력값이 있을 때 유효한 외부 URL인지 검증한다", () => {
        expect(getScheduleExternalUrlError("")).toBeNull();
        expect(getScheduleExternalUrlError(" dongle.kr/schedule ")).toBeNull();
        expect(getScheduleExternalUrlError("example.com:8080/path")).toBeNull();
        expect(getScheduleExternalUrlError("https://dongle.kr/schedule")).toBeNull();
        expect(getScheduleExternalUrlError("/schedule")).toBe("외부 링크는 http 또는 https URL로 입력해주세요.");
        expect(getScheduleExternalUrlError("javascript:alert(1)")).toBe("외부 링크는 http 또는 https URL로 입력해주세요.");
    });
});

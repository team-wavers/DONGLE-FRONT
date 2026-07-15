import { describe, expect, it } from "vitest";
import { formatRecruitDdayLabel, getClosingSoonClubs, getRecruitDday } from "./recruitment";

// 서울 기준 2026-07-06 오후 3시
const NOW = new Date("2026-07-06T06:00:00Z");

describe("getRecruitDday", () => {
    it("남은 일수를 서울 달력 기준으로 계산한다", () => {
        expect(getRecruitDday("2026-07-09T00:00:00+09:00", NOW)).toBe(3);
    });

    it("오늘 마감이면 0을 반환한다", () => {
        expect(getRecruitDday("2026-07-06T23:59:00+09:00", NOW)).toBe(0);
    });

    it("서울 날짜가 UTC 날짜와 다른 경계에서도 서울 기준으로 계산한다", () => {
        // UTC 2026-07-08 20:00 = 서울 2026-07-09 05:00
        expect(getRecruitDday("2026-07-08T20:00:00Z", NOW)).toBe(3);
    });

    it("마감이 지났으면 음수를 반환한다", () => {
        expect(getRecruitDday("2026-07-04T00:00:00+09:00", NOW)).toBe(-2);
    });

    it("값이 없거나 파싱할 수 없으면 null을 반환한다", () => {
        expect(getRecruitDday(null, NOW)).toBeNull();
        expect(getRecruitDday(undefined, NOW)).toBeNull();
        expect(getRecruitDday("", NOW)).toBeNull();
        expect(getRecruitDday("not-a-date", NOW)).toBeNull();
    });
});

describe("formatRecruitDdayLabel", () => {
    it("0이면 D-DAY, 그 외에는 D-N으로 표기한다", () => {
        expect(formatRecruitDdayLabel(0)).toBe("D-DAY");
        expect(formatRecruitDdayLabel(3)).toBe("D-3");
    });
});

describe("getClosingSoonClubs", () => {
    const clubs = [
        { id: 1, is_recruiting: true, recruit_end: "2026-07-13T00:00:00+09:00" }, // D-7
        { id: 2, is_recruiting: true, recruit_end: "2026-07-06T00:00:00+09:00" }, // D-DAY
        { id: 3, is_recruiting: true, recruit_end: "2026-07-20T00:00:00+09:00" }, // D-14 (제외)
        { id: 4, is_recruiting: false, recruit_end: "2026-07-07T00:00:00+09:00" }, // 모집마감 (제외)
        { id: 5, is_recruiting: true, recruit_end: "2026-07-05T00:00:00+09:00" }, // 지남 (제외)
        { id: 6, is_recruiting: true, recruit_end: null }, // 기간 미정 (제외)
    ];

    it("모집중이면서 기한 내 마감인 동아리만 임박 순으로 반환한다", () => {
        const result = getClosingSoonClubs(clubs, { now: NOW });

        expect(result.map((entry) => entry.club.id)).toEqual([2, 1]);
        expect(result.map((entry) => entry.dday)).toEqual([0, 7]);
    });

    it("withinDays를 조절할 수 있다", () => {
        const result = getClosingSoonClubs(clubs, { withinDays: 14, now: NOW });

        expect(result.map((entry) => entry.club.id)).toEqual([2, 1, 3]);
    });
});

import { describe, expect, test } from "vitest";
import {
    formatDateByLocale,
    formatDateForRequest,
    formatDateRange,
    formatDateTimeForInput,
    formatDateTimeForRequest,
    formatMonthKey,
    getMonthDateTimeRange,
    parseMonthKey,
} from "./date";

describe("date utils", () => {
    test("Date 값을 로컬 날짜 요청 문자열로 변환한다", () => {
        expect(formatDateForRequest(new Date(2026, 4, 20))).toBe("2026-05-20");
    });

    test("Date 값을 로컬 날짜시간 요청 문자열로 변환한다", () => {
        expect(formatDateTimeForRequest(new Date(2026, 4, 20, 9, 30, 0))).toBe("2026-05-20 09:30:00");
    });

    test("datetime-local 입력값을 timezone 변환 없이 요청 문자열로 변환한다", () => {
        expect(formatDateTimeForRequest("2026-05-20T19:00")).toBe("2026-05-20 19:00:00");
    });

    test("ISO 응답을 지정 timezone의 datetime-local 입력값으로 변환한다", () => {
        expect(formatDateTimeForInput("2026-05-20T10:00:00.000Z", { timeZone: "Asia/Seoul" })).toBe("2026-05-20T19:00");
    });

    test("월 시작과 끝 DateTime 범위를 서버 요청 문자열로 반환한다", () => {
        const range = getMonthDateTimeRange(new Date("2026-05-18T12:00:00.000Z"), { timeZone: "Asia/Seoul" });

        expect(range).toEqual({
            from: "2026-05-01 00:00:00",
            to: "2026-05-31 23:59:59",
        });
    });

    test("날짜 표시는 기본적으로 Seoul 기준 날짜를 반환한다", () => {
        expect(formatDateByLocale("2026-05-01T00:30:00.000Z")).toBe("2026.05.01");
    });

    test("timezone 없는 서버 datetime 문자열은 Seoul 로컬 날짜로 표시한다", () => {
        expect(formatDateByLocale("2026-05-20T18:00:00")).toBe("2026.05.20");
        expect(formatDateForRequest("2026-05-20T18:00:00", { timeZone: "Asia/Seoul" })).toBe("2026-05-20");
    });

    test("날짜 범위 표시는 기본적으로 Seoul 기준 날짜를 반환한다", () => {
        expect(formatDateRange("2026-05-01T00:30:00.000Z", "2026-05-31T15:00:00.000Z")).toBe(
            "2026.05.01 ~ 2026.06.01"
        );
    });

    test("월 key는 지정 timezone 기준 월을 반환하고 timezone 없는 첫날 Date로 복원한다", () => {
        const monthKey = formatMonthKey(new Date("2026-05-01T00:30:00.000Z"), { timeZone: "Asia/Seoul" });

        expect(monthKey).toBe("2026-05");
        expect(parseMonthKey(monthKey)).toEqual(new Date(2026, 4, 1));
    });
});

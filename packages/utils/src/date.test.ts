import { describe, expect, test } from "vitest";
import { formatDateForRequest, formatDateTimeForInput, formatDateTimeForRequest, getMonthDateTimeRange } from "./date";

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
});

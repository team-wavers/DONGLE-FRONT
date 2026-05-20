import { describe, expect, test } from "vitest";
import { formatDatePickerValue, parseDatePickerValue } from "./date-picker-value";

describe("formatDatePickerValue", () => {
    test("선택한 로컬 날짜를 UTC 변환 없이 yyyy-MM-dd로 유지한다", () => {
        const selectedDate = new Date(2026, 4, 20);

        expect(formatDatePickerValue(selectedDate)).toBe("2026-05-20");
    });

    test("날짜가 없으면 빈 문자열을 반환한다", () => {
        expect(formatDatePickerValue(undefined)).toBe("");
    });

    test("시간 포함 옵션이면 UTC 변환 없이 yyyy-MM-dd HH:mm:ss로 유지한다", () => {
        const selectedDate = new Date(2026, 4, 20, 9, 30, 0);

        expect(formatDatePickerValue(selectedDate, { includeTime: true })).toBe("2026-05-20 09:30:00");
    });
});

describe("parseDatePickerValue", () => {
    test("date-only 문자열은 UTC 파싱 없이 로컬 날짜로 복원한다", () => {
        const date = parseDatePickerValue("2026-05-20");

        expect(date?.getFullYear()).toBe(2026);
        expect(date?.getMonth()).toBe(4);
        expect(date?.getDate()).toBe(20);
        expect(date?.getHours()).toBe(0);
    });

    test("datetime-local 문자열은 timezone 변환 없이 로컬 날짜시간으로 복원한다", () => {
        const date = parseDatePickerValue("2026-05-20 09:30:00");

        expect(date?.getFullYear()).toBe(2026);
        expect(date?.getMonth()).toBe(4);
        expect(date?.getDate()).toBe(20);
        expect(date?.getHours()).toBe(9);
        expect(date?.getMinutes()).toBe(30);
    });

    test("존재하지 않는 로컬 날짜시간은 undefined로 반환한다", () => {
        expect(parseDatePickerValue("2026-02-31")).toBeUndefined();
        expect(parseDatePickerValue("2026-06-16T24:00")).toBeUndefined();
    });
});

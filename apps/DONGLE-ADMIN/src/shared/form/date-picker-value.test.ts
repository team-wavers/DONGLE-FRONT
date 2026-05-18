import { describe, expect, test } from "vitest";
import { formatDatePickerValue } from "./date-picker-value";

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

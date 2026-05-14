import { describe, expect, test } from "vitest";
import { normalizeDateTimeToApiFormat } from "./main-banner-datetime";

describe("main banner datetime helpers", () => {
    test("normalizeDateTimeToApiFormat은 시간 포함 입력값을 API 일시 문자열로 변환한다", () => {
        expect(normalizeDateTimeToApiFormat("2026-05-01T09:30")).toBe("2026-05-01 09:30:00");
        expect(normalizeDateTimeToApiFormat(" 2026-05-01 09:30:15 ")).toBe("2026-05-01 09:30:15");
    });
});

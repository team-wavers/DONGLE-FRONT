import { expect, test } from "vitest";
import { formatUserCreatedAt } from "./format-user-created-at";

test("formatUserCreatedAt는 Asia/Seoul 기준 날짜를 반환한다", () => {
    expect(formatUserCreatedAt("2023-01-01T23:30:00Z")).toBe("2023. 01. 02.");
});

test("formatUserCreatedAt는 잘못된 날짜 입력이면 원문을 반환한다", () => {
    expect(formatUserCreatedAt("not-a-date")).toBe("not-a-date");
});

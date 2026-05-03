import { expect, test } from "vitest";
import { trimToEmpty, trimToNull } from "./string";

test("trimToEmpty는 문자열 공백을 제거하고 nullish/비문자열은 빈 문자열로 정규화한다", () => {
    expect(trimToEmpty("  dongle  ")).toBe("dongle");
    expect(trimToEmpty(null)).toBe("");
    expect(trimToEmpty(undefined)).toBe("");
    expect(trimToEmpty(new File([""], "sample.txt"))).toBe("");
});

test("trimToNull은 공백 문자열을 null로 바꾼다", () => {
    expect(trimToNull("  ")).toBeNull();
    expect(trimToNull("value")).toBe("value");
});

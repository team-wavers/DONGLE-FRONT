import { expect, test } from "vitest";
import { isValidMobilePhoneNumber, normalizePhoneNumber, trimToEmpty, trimToNull } from "./string-normalization";

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

test("normalizePhoneNumber는 공백을 제거한다", () => {
    expect(normalizePhoneNumber("010 1234 5678")).toBe("01012345678");
});

test("isValidMobilePhoneNumber는 휴대폰 번호 형식을 검증한다", () => {
    expect(isValidMobilePhoneNumber("010 1234 5678")).toBe(true);
    expect(isValidMobilePhoneNumber("010-1234-5678")).toBe(true);
    expect(isValidMobilePhoneNumber("02-123-4567")).toBe(false);
});

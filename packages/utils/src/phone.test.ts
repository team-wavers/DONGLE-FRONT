import { expect, test } from "vitest";
import { formatMobilePhoneNumber, isValidMobilePhoneNumber, normalizePhoneNumber } from "./phone";

test("normalizePhoneNumber는 공백을 제거한다", () => {
    expect(normalizePhoneNumber("010 1234 5678")).toBe("01012345678");
});

test("formatMobilePhoneNumber는 휴대폰 번호를 하이픈 형식으로 표시한다", () => {
    expect(formatMobilePhoneNumber("01012345678")).toBe("010-1234-5678");
    expect(formatMobilePhoneNumber("010 1234 5678")).toBe("010-1234-5678");
    expect(formatMobilePhoneNumber("0111234567")).toBe("011-123-4567");
    expect(formatMobilePhoneNumber("02-123-4567")).toBe("02-123-4567");
});

test("isValidMobilePhoneNumber는 휴대폰 번호 형식을 검증한다", () => {
    expect(isValidMobilePhoneNumber("010 1234 5678")).toBe(true);
    expect(isValidMobilePhoneNumber("010-1234-5678")).toBe(true);
    expect(isValidMobilePhoneNumber("02-123-4567")).toBe(false);
});

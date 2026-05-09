import { expect, test } from "vitest";
import { isAllowedInternalReturnPath, normalizeInternalReturnTo } from "./normalize-internal-return-to";

test("normalizeInternalReturnTo는 내부 경로와 query/hash를 유지한다", () => {
    expect(normalizeInternalReturnTo("/admin/club/4?tab=report#section")).toBe("/admin/club/4?tab=report#section");
});

test("normalizeInternalReturnTo는 빈 값을 거부한다", () => {
    expect(normalizeInternalReturnTo(null)).toBeNull();
    expect(normalizeInternalReturnTo("   ")).toBeNull();
});

test("normalizeInternalReturnTo는 protocol-relative URL을 거부한다", () => {
    expect(normalizeInternalReturnTo("//attacker.com/phishing")).toBeNull();
});

test("normalizeInternalReturnTo는 외부 URL 문자열을 거부한다", () => {
    expect(normalizeInternalReturnTo("https://attacker.com")).toBeNull();
});

test("normalizeInternalReturnTo는 인코딩된 우회 문자열을 거부한다", () => {
    expect(normalizeInternalReturnTo("%2F%2Fevil.com%2Fcallback")).toBeNull();
});

test("isAllowedInternalReturnPath는 내부 경로만 허용한다", () => {
    expect(isAllowedInternalReturnPath("/admin")).toBe(true);
    expect(isAllowedInternalReturnPath("https://attacker.com")).toBe(false);
});

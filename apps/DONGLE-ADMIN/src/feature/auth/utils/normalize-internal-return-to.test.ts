import { expect, test } from "vitest";
import { normalizeInternalReturnTo } from "./normalize-internal-return-to";

test("normalizeInternalReturnTo는 내부 경로와 query/hash를 유지한다", () => {
    expect(normalizeInternalReturnTo("/admin/club/4?tab=report#section")).toBe("/admin/club/4?tab=report#section");
});

test("normalizeInternalReturnTo는 protocol-relative URL을 거부한다", () => {
    expect(normalizeInternalReturnTo("//attacker.com/phishing")).toBeNull();
});

test("normalizeInternalReturnTo는 외부 URL 문자열을 거부한다", () => {
    expect(normalizeInternalReturnTo("https://attacker.com")).toBeNull();
});

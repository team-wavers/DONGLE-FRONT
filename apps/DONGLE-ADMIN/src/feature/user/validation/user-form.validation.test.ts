import { expect, test } from "vitest";
import {
    USER_FORM_MESSAGES,
    validateLoginId,
    validatePassword,
    validateUserPhone,
    validateUserRole,
} from "./user-form.validation";

test("validateLoginId는 공백 입력을 거부한다", () => {
    expect(validateLoginId("   ")).toBe(USER_FORM_MESSAGES.loginIdRequired);
});

test("validatePassword는 선택 입력일 때 빈 값을 허용한다", () => {
    expect(validatePassword("", false)).toBeUndefined();
    expect(validatePassword("", true)).toBe(USER_FORM_MESSAGES.passwordRequired);
});

test("validateUserRole은 허용된 역할만 통과시킨다", () => {
    expect(validateUserRole("admin")).toBeUndefined();
    expect(validateUserRole("president")).toBeUndefined();
    expect(validateUserRole("staff")).toBe(USER_FORM_MESSAGES.roleRequired);
});

test("validateUserPhone은 올바른 휴대폰 형식을 검증한다", () => {
    expect(validateUserPhone("010-1234-5678")).toBeUndefined();
    expect(validateUserPhone("010123")).toBe(USER_FORM_MESSAGES.phoneInvalid);
});

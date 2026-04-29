import { describe, expect, test } from "vitest";
import {
    mapLoginActionError,
    normalizeUsernameInput,
    preservePasswordInput,
    validateLoginFields,
} from "./login-form-policy";

describe("login-form-policy", () => {
    test("username은 trim 이후 빈 값이면 필드 오류를 반환한다", () => {
        const username = normalizeUsernameInput("   ");
        const password = preservePasswordInput("");

        expect(validateLoginFields(username, password)).toEqual({
            username: "아이디를 입력해주세요",
            password: "비밀번호를 입력해주세요",
        });
    });

    test("password는 앞뒤 공백을 포함한 원문을 유지한다", () => {
        expect(preservePasswordInput("  pass with spaces  ")).toBe("  pass with spaces  ");
    });

    test("문자열이 아닌 입력은 빈 문자열로 정규화한다", () => {
        expect(normalizeUsernameInput(null)).toBe("");
        expect(preservePasswordInput(null)).toBe("");
    });

    test("Error 객체는 message를 유지해 action 에러로 변환한다", () => {
        expect(mapLoginActionError(new Error("network timeout"))).toEqual({
            success: false,
            error: "network timeout",
        });
    });

    test("알 수 없는 예외는 공통 에러 메시지로 분기한다", () => {
        expect(mapLoginActionError("unexpected")).toEqual({
            success: false,
            error: "로그인 처리 중 오류가 발생했습니다.",
        });
    });
});

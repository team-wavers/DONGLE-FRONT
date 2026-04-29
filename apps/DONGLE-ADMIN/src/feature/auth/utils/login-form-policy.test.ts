import { describe, expect, test } from "vitest";
import { mapLoginActionError, normalizeLoginInput, validateLoginFields } from "./login-form-policy";

describe("login-form-policy", () => {
    test("빈 값은 trim 이후 필드 오류를 반환한다", () => {
        const username = normalizeLoginInput("   ");
        const password = normalizeLoginInput("");

        expect(validateLoginFields(username, password)).toEqual({
            username: "아이디를 입력해주세요",
            password: "비밀번호를 입력해주세요",
        });
    });

    test("문자열이 아닌 입력은 빈 문자열로 정규화한다", () => {
        expect(normalizeLoginInput(null)).toBe("");
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

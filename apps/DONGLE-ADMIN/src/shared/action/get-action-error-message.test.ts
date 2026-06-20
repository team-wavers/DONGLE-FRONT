import { describe, expect, test } from "vitest";
import { getActionErrorMessage } from "./get-action-error-message";

describe("getActionErrorMessage", () => {
    test("Error 인스턴스이고 message가 있으면 그 message를 사용한다", () => {
        expect(getActionErrorMessage(new Error("실패 원인"), "기본 메시지")).toBe("실패 원인");
    });

    test("Error 인스턴스이지만 message가 빈 문자열이면 fallback을 사용한다", () => {
        expect(getActionErrorMessage(new Error(""), "기본 메시지")).toBe("기본 메시지");
    });

    test("Error가 아닌 값이면 fallback을 사용한다", () => {
        expect(getActionErrorMessage("문자열 에러", "기본 메시지")).toBe("기본 메시지");
        expect(getActionErrorMessage(undefined, "기본 메시지")).toBe("기본 메시지");
        expect(getActionErrorMessage(null, "기본 메시지")).toBe("기본 메시지");
    });
});

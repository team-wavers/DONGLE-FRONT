import { describe, expect, it } from "vitest";
import { getSessionExpiredActionFailure, isSessionExpiredError } from "./session-expired";

describe("session expired action policy", () => {
    it.each([
        new Error("Unauthorized"),
        { status: 401 },
        { message: "Unauthorized" },
        { error: { status: 401 } },
        { error: { message: "Unauthorized" } },
    ])("maps Unauthorized and 401 errors", (error) => {
        expect(isSessionExpiredError(error)).toBe(true);
        expect(getSessionExpiredActionFailure(error)).toEqual({
            formError: "로그인 시간이 만료되었습니다. 다시 로그인해주세요.",
            sessionExpired: true,
        });
    });

    it("does not map unrelated failures", () => {
        expect(isSessionExpiredError({ status: 500 })).toBe(false);
        expect(getSessionExpiredActionFailure(new Error("boom"))).toBeUndefined();
    });
});

import { afterEach, describe, expect, test, vi } from "vitest";
import * as Sentry from "@sentry/nextjs";
import { captureServerException } from "./capture-server-exception";

vi.mock("@sentry/nextjs", () => ({
    captureException: vi.fn(),
    captureMessage: vi.fn(),
}));

afterEach(() => {
    vi.clearAllMocks();
});

describe("captureServerException", () => {
    test("extra에서 login_id/password/registrationKey/token을 제거한다", () => {
        captureServerException(new Error("boom"), "동아리 등록 중 오류", {
            action: "submitClubRegisterAction",
            registrationKey: "secret-key",
            login_id: "admin",
            password: "hunter2",
            token: "abc",
            accessToken: "abc",
            refreshToken: "abc",
        });

        expect(Sentry.captureException).toHaveBeenCalledWith(
            expect.any(Error),
            expect.objectContaining({
                extra: {
                    message: "동아리 등록 중 오류",
                    action: "submitClubRegisterAction",
                },
            })
        );
    });

    test("Error가 아닌 값은 captureMessage로 보내고 extra를 동일하게 정제한다", () => {
        captureServerException("unexpected", "예상치 못한 오류", {
            login_id: "admin",
            action: "submitUserCreateAction",
        });

        expect(Sentry.captureMessage).toHaveBeenCalledWith(
            "예상치 못한 오류",
            expect.objectContaining({
                extra: {
                    error: "unexpected",
                    action: "submitUserCreateAction",
                },
            })
        );
    });
});

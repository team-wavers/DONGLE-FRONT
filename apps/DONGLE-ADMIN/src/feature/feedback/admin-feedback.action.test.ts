import { afterEach, describe, expect, test, vi } from "vitest";
import { createFeedbackService } from "@dongle/service/feedback/feedback.service";
import { submitAdminFeedbackAction } from "./admin-feedback.action";

vi.mock("@dongle/service/feedback/feedback.service", () => ({
    createFeedbackService: vi.fn(),
}));

vi.mock("@/shared/action", async () => {
    const actual = await vi.importActual<typeof import("@/shared/action")>("@/shared/action");
    return {
        ...actual,
        requireServerActionAccessToken: vi.fn().mockResolvedValue("access-token"),
    };
});

vi.mock("@/lib/sentry/capture-server-exception", () => ({
    captureServerException: vi.fn(),
}));

const validInput = {
    category: "bug" as const,
    content: "문의합니다",
    pageUrl: "https://example.com",
};

describe("submitAdminFeedbackAction", () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    test("서비스가 401을 반환하면 세션 만료 실패 응답을 반환한다", async () => {
        vi.mocked(createFeedbackService).mockResolvedValue({
            isSuccess: false,
            error: {
                message: "Unauthorized",
                detail: "토큰이 만료되었습니다.",
                status: 401,
            },
        });

        const result = await submitAdminFeedbackAction(validInput);

        expect(result).toEqual({
            ok: false,
            formError: "로그인 시간이 만료되었습니다. 다시 로그인해주세요.",
            sessionExpired: true,
        });
    });

    test("서비스가 401이 아닌 실패를 반환하면 세션 만료 없이 실패 응답을 반환한다", async () => {
        vi.mocked(createFeedbackService).mockResolvedValue({
            isSuccess: false,
            error: {
                message: "서버 오류",
                detail: "",
                status: 500,
            },
        });

        const result = await submitAdminFeedbackAction(validInput);

        expect(result).toEqual({
            ok: false,
            formError: "서버 오류",
        });
    });

    test("서비스 성공 시 성공 응답을 반환한다", async () => {
        vi.mocked(createFeedbackService).mockResolvedValue({
            isSuccess: true,
            result: {
                issueUrl: "https://github.com/team-wavers/DONGLE-FRONT/issues/1",
                issueNumber: 1,
            },
        });

        const result = await submitAdminFeedbackAction(validInput);

        expect(result).toEqual({
            ok: true,
            data: {
                issueUrl: "https://github.com/team-wavers/DONGLE-FRONT/issues/1",
                issueNumber: 1,
            },
            message: "문의가 이슈로 등록되었습니다.",
        });
    });
});

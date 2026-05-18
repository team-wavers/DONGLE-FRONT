import { afterEach, expect, test, vi } from "vitest";
import { submitActivityReportUpdateAction } from "@/feature/report/form/activity-report.action";
import { reportActionNetwork } from "@/feature/report/action/report-action-network";
import { requireServerActionAccessToken } from "@/shared/action/server-action-auth";

vi.mock("@/shared/action/server-action-auth", () => ({
    requireServerActionAccessToken: vi.fn().mockResolvedValue("token"),
}));

vi.mock("@/lib/sentry/capture-server-exception", () => ({
    captureServerException: vi.fn(),
}));

vi.mock("next/cache", () => ({
    revalidateTag: vi.fn(),
}));

afterEach(() => {
    vi.restoreAllMocks();
});

function makeInput() {
    return {
        clubId: "1",
        reportId: "3",
        values: {
            title: "변경 제목",
            content: "변경 내용은 최소 길이를 만족합니다.",
            imageUrls: [],
            imageFile: null,
        },
        originalReport: {
            title: "원본 제목",
            content: "원본 내용은 충분히 깁니다.",
            image_urls: [],
        },
    };
}

test("인증 만료 분기에서 세션 만료 규약을 반환한다", async () => {
    vi.mocked(requireServerActionAccessToken).mockRejectedValue(new Error("Unauthorized"));

    const result = await submitActivityReportUpdateAction(makeInput());

    expect(result).toMatchObject({
        ok: false,
        errorType: "form",
        sessionExpired: true,
        retryable: false,
    });
});

test("서비스 실패 분기에서 동일한 규약 응답을 반환한다", async () => {
    vi.spyOn(reportActionNetwork, "uploadImages").mockResolvedValue([]);
    vi.spyOn(reportActionNetwork, "updateReport").mockResolvedValue({ isSuccess: false, result: undefined, error: { message: "bad", detail: "bad" } });

    const result = await submitActivityReportUpdateAction(makeInput());

    expect(result).toMatchObject({
        ok: false,
        errorType: "form",
        retryable: true,
        formError: "활동보고서 수정에 실패했습니다. 다시 시도해주세요.",
    });
});

import { afterEach, expect, test, vi } from "vitest";
import { updateActivityReportAction } from "./update-activity-report-form.action";
import { reportActionNetwork } from "./report-action-network";
import { requireServerActionAccessToken } from "@/feature/shared/action/server-action-auth";

vi.mock("@/feature/shared/action/server-action-auth", () => ({
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

function makeFormData() {
    const formData = new FormData();
    formData.set("title", "변경 제목");
    formData.set("content", "변경 내용은 최소 길이를 만족합니다.");
    formData.set("reportId", "3");
    formData.set("clubId", "1");
    formData.set("originalTitle", "원본 제목");
    formData.set("originalContent", "원본 내용은 충분히 깁니다.");
    formData.set("originalImageUrls", "[]");
    formData.set("existingUrls", "[]");
    formData.set("removedUrls", "[]");
    return formData;
}

test("인증 만료 분기에서 세션 만료 규약을 반환한다", async () => {
    vi.mocked(requireServerActionAccessToken).mockRejectedValue(new Error("Unauthorized"));

    const result = await updateActivityReportAction({}, makeFormData());

    expect(result).toMatchObject({
        errorType: "form",
        sessionExpired: true,
        retryable: false,
    });
});

test("서비스 실패 분기에서 동일한 규약 응답을 반환한다", async () => {
    vi.spyOn(reportActionNetwork, "uploadImages").mockResolvedValue([]);
    vi.spyOn(reportActionNetwork, "updateReport").mockResolvedValue({ isSuccess: false, result: undefined, error: { message: "bad", detail: "bad" } });

    const result = await updateActivityReportAction({}, makeFormData());

    expect(result).toMatchObject({
        errorType: "form",
        retryable: true,
        error: "활동보고서 수정에 실패했습니다. 다시 시도해주세요.",
    });
});

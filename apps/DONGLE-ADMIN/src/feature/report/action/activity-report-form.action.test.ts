import { afterEach, expect, test, vi } from "vitest";
import { activityReportAction } from "./activity-report-form.action";
import { reportActionNetwork } from "./report-action-network";

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
    formData.set("title", "제목입니다");
    formData.set("content", "내용은 최소 길이를 만족하는 문장입니다.");
    formData.set("clubId", "1");
    return formData;
}

test("업로드 실패 분기에서 동일한 규약 응답을 반환한다", async () => {
    vi.spyOn(reportActionNetwork, "uploadImages").mockRejectedValue(new Error("fail"));

    const result = await activityReportAction({}, makeFormData());

    expect(result).toMatchObject({
        errorType: "form",
        retryable: true,
        error: "이미지 업로드에 실패했습니다. 다시 시도해주세요.",
    });
});

test("서비스 실패 분기에서 동일한 규약 응답을 반환한다", async () => {
    vi.spyOn(reportActionNetwork, "uploadImages").mockResolvedValue([]);
    vi.spyOn(reportActionNetwork, "createReport").mockResolvedValue({ isSuccess: false, result: undefined, error: { message: "bad", detail: "bad" } });

    const result = await activityReportAction({}, makeFormData());

    expect(result).toMatchObject({
        errorType: "form",
        retryable: true,
        error: "활동보고서 생성에 실패했습니다. 다시 시도해주세요.",
    });
});

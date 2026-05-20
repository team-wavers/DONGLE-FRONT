import { afterEach, expect, test, vi } from "vitest";
import { submitActivityReportCreateAction } from "@/feature/report/form/activity-report.action";
import { reportActionNetwork } from "@/feature/report/action/report-action-network";
import { revalidateTag } from "next/cache";

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

function makeValues() {
    return {
        title: "제목입니다",
        content: "내용은 최소 길이를 만족하는 문장입니다.",
        imageUrls: [],
        imageFile: null,
    };
}

test("업로드 실패 분기에서 동일한 규약 응답을 반환한다", async () => {
    vi.spyOn(reportActionNetwork, "uploadImages").mockRejectedValue(new Error("fail"));

    const result = await submitActivityReportCreateAction({ clubId: "1", values: makeValues() });

    expect(result).toMatchObject({
        ok: false,
        errorType: "form",
        retryable: true,
        formError: "이미지 업로드에 실패했습니다. 다시 시도해주세요.",
    });
});

test("서비스 실패 분기에서 동일한 규약 응답을 반환한다", async () => {
    vi.spyOn(reportActionNetwork, "uploadImages").mockResolvedValue([]);
    vi.spyOn(reportActionNetwork, "createReport").mockResolvedValue({ isSuccess: false, result: undefined, error: { message: "bad", detail: "bad" } });

    const result = await submitActivityReportCreateAction({ clubId: "1", values: makeValues() });

    expect(result).toMatchObject({
        ok: false,
        errorType: "form",
        retryable: true,
        formError: "활동보고서 생성에 실패했습니다. 다시 시도해주세요.",
    });
});

test("생성 성공 시 보고서 목록과 동아리 보고서 태그를 초기화한다", async () => {
    vi.spyOn(reportActionNetwork, "uploadImages").mockResolvedValue([]);
    vi.spyOn(reportActionNetwork, "createReport").mockResolvedValue({
        isSuccess: true,
        result: {
            id: 5,
            club_id: 1,
            title: "제목입니다",
            content: "내용은 최소 길이를 만족하는 문장입니다.",
            image_urls: [],
            createdAt: "2026-05-18T00:00:00.000Z",
            updatedAt: "2026-05-18T00:00:00.000Z",
            deletedAt: null,
        },
    });

    const result = await submitActivityReportCreateAction({ clubId: "1", values: makeValues() });

    expect(result.ok).toBe(true);
    expect(revalidateTag).toHaveBeenCalledWith("report");
    expect(revalidateTag).toHaveBeenCalledWith("report-club-1");
});

import { afterEach, describe, expect, test, vi } from "vitest";
import { deleteMainBannerService } from "@dongle/service/main-banner/main-banner.service";
import { revalidateTag } from "next/cache";
import { deleteMainBannerAction } from "./delete-main-banner.action";

vi.mock("@dongle/service/main-banner/main-banner.service", () => ({
    deleteMainBannerService: vi.fn(),
}));

vi.mock("@/shared/action/server-action-auth", () => ({
    requireServerActionAccessToken: vi.fn().mockResolvedValue("access-token"),
}));

vi.mock("@/lib/sentry/capture-server-exception", () => ({
    captureServerException: vi.fn(),
}));

vi.mock("next/cache", () => ({
    revalidateTag: vi.fn(),
}));

describe("deleteMainBannerAction", () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    test("배너 삭제 성공 시 태그를 초기화하고 ActionResult 성공을 반환한다", async () => {
        vi.mocked(deleteMainBannerService).mockResolvedValue({
            isSuccess: true,
            result: null,
        });

        const result = await deleteMainBannerAction(7);

        expect(result).toEqual({
            ok: true,
            data: null,
            message: "배너가 삭제되었습니다.",
            redirectTo: "/admin/banner",
        });
        expect(deleteMainBannerService).toHaveBeenCalledWith(7);
        expect(revalidateTag).toHaveBeenCalledWith("main-banner");
        expect(revalidateTag).toHaveBeenCalledWith("main-banner-7");
    });

    test("배너 삭제 실패 시 태그를 초기화하지 않고 ActionResult 실패를 반환한다", async () => {
        vi.mocked(deleteMainBannerService).mockResolvedValue({
            isSuccess: false,
            error: {
                message: "삭제 실패",
                detail: "banner error",
            },
        });

        const result = await deleteMainBannerAction(7);

        expect(result).toEqual({
            ok: false,
            formError: "삭제 실패",
        });
        expect(revalidateTag).not.toHaveBeenCalled();
    });
});

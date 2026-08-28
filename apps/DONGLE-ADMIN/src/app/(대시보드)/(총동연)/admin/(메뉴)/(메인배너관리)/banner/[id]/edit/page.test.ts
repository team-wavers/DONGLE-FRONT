import { afterEach, expect, test, vi } from "vitest";
import { getAdminMainBannerService } from "@/lib/server/cached-services";
import EditMainBannerPage from "./page";

vi.mock("@/lib/server/cached-services", () => ({
    getAdminMainBannerService: vi.fn(),
}));

vi.mock("next/navigation", () => ({
    notFound: vi.fn(() => {
        throw new Error("NEXT_NOT_FOUND");
    }),
}));

afterEach(() => {
    vi.clearAllMocks();
});

test("배너 상세 transport 예외를 페이지 오류로 정규화한다", async () => {
    vi.mocked(getAdminMainBannerService).mockRejectedValue(new Error("network error"));

    await expect(EditMainBannerPage({ params: Promise.resolve({ id: "7" }) })).rejects.toThrow(
        "배너 정보를 불러오는데 실패했습니다."
    );
});

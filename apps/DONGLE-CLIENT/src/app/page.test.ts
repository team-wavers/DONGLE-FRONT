import { afterEach, expect, test, vi } from "vitest";
import { getClubListService, getPublicMainBannerListService } from "@/lib/server/cached-services";
import { loadHomePageViewData } from "./home-page-data";

vi.mock("@/lib/server/cached-services", () => ({
    getClubListService: vi.fn(),
    getDisplayMainBannerItems: vi.fn((banners) => banners),
    getPublicMainBannerListService: vi.fn(),
}));

afterEach(() => {
    vi.clearAllMocks();
});

test("홈 페이지 데이터 로더는 동아리 목록 조회 예외를 실패 상태로 정규화한다", async () => {
    vi.mocked(getClubListService).mockRejectedValue(new Error("network error"));
    vi.mocked(getPublicMainBannerListService).mockResolvedValue({
        isSuccess: true,
        result: [],
    });

    const result = await loadHomePageViewData();

    expect(result).toMatchObject({
        clubs: [],
        banners: [],
        clubsLoadFailed: true,
    });
});

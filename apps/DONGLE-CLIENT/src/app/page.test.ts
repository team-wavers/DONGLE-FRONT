import { afterEach, expect, test, vi } from "vitest";
import { getClubListService, getPublicMainBannerListService } from "@/lib/server/cached-services";
import { loadHomePageViewData } from "./home-page-data";

vi.mock("@/lib/server/cached-services", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@/lib/server/cached-services")>();

    return {
        ...actual,
        getClubListService: vi.fn(),
        getPublicMainBannerListService: vi.fn(),
    };
});

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

test("홈 페이지 데이터 로더는 실제 배너 표시 helper로 기간 밖 배너를 제외한다", async () => {
    vi.mocked(getClubListService).mockResolvedValue({ isSuccess: true, result: [] });
    vi.mocked(getPublicMainBannerListService).mockResolvedValue({
        isSuccess: true,
        result: [
            {
                id: 1,
                image_url: "https://cdn.example.com/banner.png",
                link_url: "/clubs",
                publish_start_at: "2099-05-01 00:00:00",
                publish_end_at: "2099-05-01 23:59:59",
                is_active: true,
                created_at: "2026-05-01 00:00:00",
                updated_at: "2026-05-01 00:00:00",
                deleted_at: null,
            },
        ],
    });

    const result = await loadHomePageViewData();

    expect(result.banners).toEqual([]);
});

test("홈 페이지 배너 필터는 Seoul wall-clock 경계를 timezone과 무관하게 적용한다", async () => {
    const banner = {
        id: 1,
        image_url: "https://cdn.example.com/banner.png",
        link_url: "/clubs",
        publish_start_at: "2026-05-01 00:00:00",
        publish_end_at: "2026-05-01 23:59:59",
        is_active: true,
        created_at: "2026-05-01 00:00:00",
        updated_at: "2026-05-01 00:00:00",
        deleted_at: null,
    };

    vi.mocked(getClubListService).mockResolvedValue({ isSuccess: true, result: [] });
    vi.mocked(getPublicMainBannerListService).mockResolvedValue({
        isSuccess: true,
        result: [banner],
    });

    const included = await loadHomePageViewData(new Date("2026-04-30T15:30:00.000Z"));
    const excluded = await loadHomePageViewData(new Date("2026-04-30T14:59:59.000Z"));

    expect(included.banners).toHaveLength(1);
    expect(excluded.banners).toHaveLength(0);
});

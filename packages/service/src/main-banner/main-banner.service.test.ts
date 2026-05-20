import { beforeEach, describe, expect, test, vi } from "vitest";

const fetchInstanceMock = vi.hoisted(() => ({
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
}));

vi.mock("@dongle/api/instance", () => ({
    default: {
        getInstance: () => fetchInstanceMock,
    },
}));

import {
    getAdminMainBannerService,
    getAdminMainBannerListService,
    getPublicMainBannerListService,
} from "./main-banner.service";

describe("main banner service endpoints", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        fetchInstanceMock.get.mockResolvedValue({
            isSuccess: true,
            result: [],
        });
    });

    test("사용자용 배너 목록은 공개 엔드포인트를 호출한다", async () => {
        await getPublicMainBannerListService();

        expect(fetchInstanceMock.get).toHaveBeenCalledWith("/main-banners", {
            cache: "force-cache",
            next: {
                tags: ["main-banner"],
                revalidate: 60,
            },
        });
    });

    test("사용자용 배너 목록은 캐시를 끄면 공개 엔드포인트를 no-store로 호출한다", async () => {
        await getPublicMainBannerListService(false);

        expect(fetchInstanceMock.get).toHaveBeenCalledWith("/main-banners", {
            cache: "no-store",
        });
    });

    test("관리자용 배너 목록은 관리자 엔드포인트를 호출한다", async () => {
        await getAdminMainBannerListService();

        expect(fetchInstanceMock.get).toHaveBeenCalledWith("/main-banners/admin", {
            cache: "no-store",
        });
    });

    test("관리자용 배너 상세는 관리자 단건 엔드포인트를 no-store로 호출한다", async () => {
        fetchInstanceMock.get.mockResolvedValueOnce({
            isSuccess: true,
            result: { id: 2, image_url: "https://cdn.example.com/2.png" },
        });

        const result = await getAdminMainBannerService(2);

        expect(fetchInstanceMock.get).toHaveBeenCalledWith("/main-banners/admin/2", {
            cache: "no-store",
        });
        expect(result).toEqual({
            isSuccess: true,
            result: { id: 2, image_url: "https://cdn.example.com/2.png" },
        });
    });
});

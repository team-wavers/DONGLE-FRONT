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

import { createClubService, deleteClubService, getClubListService, getClubService, updateClubService } from "./club.service";

describe("club service cache policy", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        fetchInstanceMock.get.mockResolvedValue({ isSuccess: true, result: [] });
        fetchInstanceMock.post.mockResolvedValue({ isSuccess: true, result: { id: 1 } });
        fetchInstanceMock.put.mockResolvedValue({ isSuccess: true, result: { id: 1 } });
        fetchInstanceMock.delete.mockResolvedValue({ isSuccess: true, result: null });
    });

    test("공개 동아리 목록은 공개 캐시 태그와 revalidate를 사용한다", async () => {
        await getClubListService();

        expect(fetchInstanceMock.get).toHaveBeenCalledWith("/clubs", {
            cache: "force-cache",
            next: {
                tags: ["club"],
                revalidate: 120,
            },
        });
    });

    test("공개 동아리 상세는 목록/상세 태그와 revalidate를 사용한다", async () => {
        await getClubService(7);

        expect(fetchInstanceMock.get).toHaveBeenCalledWith("/clubs/7", {
            cache: "force-cache",
            next: {
                tags: ["club", "club-7"],
                revalidate: 120,
            },
        });
    });

    test("관리자 동아리 조회는 no-store만 사용한다", async () => {
        await getClubService(7, "admin");

        expect(fetchInstanceMock.get).toHaveBeenCalledWith("/clubs/7", {
            cache: "no-store",
        });
    });

    test("동아리 mutation service는 fetch cache 옵션을 붙이지 않는다", async () => {
        await createClubService({ name: "동글" } as Parameters<typeof createClubService>[0]);
        await updateClubService(7, { name: "수정" } as Parameters<typeof updateClubService>[1]);
        await deleteClubService(7);

        expect(fetchInstanceMock.post).toHaveBeenCalledWith("/clubs", { name: "동글" });
        expect(fetchInstanceMock.put).toHaveBeenCalledWith("/clubs/7", { name: "수정" });
        expect(fetchInstanceMock.delete).toHaveBeenCalledWith("/clubs/7");
    });
});

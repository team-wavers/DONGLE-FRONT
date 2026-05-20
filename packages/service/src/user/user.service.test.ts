import { beforeEach, describe, expect, test, vi } from "vitest";

const fetchInstanceMock = vi.hoisted(() => ({
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
}));

vi.mock("@dongle/api/instance", () => ({
    default: {
        getInstance: () => fetchInstanceMock,
    },
}));

import { getUserListService, getUserService, patchUserService } from "./user.service";

describe("user service cache policy", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        fetchInstanceMock.get.mockResolvedValue({ isSuccess: true, result: [] });
        fetchInstanceMock.patch.mockResolvedValue({ isSuccess: true, result: { id: 1 } });
    });

    test("사용자 목록과 상세는 no-store만 사용한다", async () => {
        await getUserListService();
        await getUserService(3);

        expect(fetchInstanceMock.get).toHaveBeenNthCalledWith(1, "/users", {
            cache: "no-store",
        });
        expect(fetchInstanceMock.get).toHaveBeenNthCalledWith(2, "/users/3", {
            cache: "no-store",
        });
    });

    test("사용자 mutation service는 fetch cache 옵션을 붙이지 않는다", async () => {
        await patchUserService(3, { name: "수정" } as Parameters<typeof patchUserService>[1]);

        expect(fetchInstanceMock.patch).toHaveBeenCalledWith("/users/3", { name: "수정" });
    });
});

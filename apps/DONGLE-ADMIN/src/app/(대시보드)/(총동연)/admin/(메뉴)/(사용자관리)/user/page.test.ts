import { afterEach, expect, test, vi } from "vitest";
import { getAccessTokenFromServerCookie } from "@dongle/api/utils/cookie/server-cookie.util";
import { getUserIdFromToken } from "@dongle/api/utils/jwt.util";
import { getUserListService } from "@/lib/server/cached-services";
import { loadUserListViewModel } from "./user-list-view-model";

vi.mock("@dongle/api/utils/cookie/server-cookie.util", () => ({
    getAccessTokenFromServerCookie: vi.fn(),
}));

vi.mock("@dongle/api/utils/jwt.util", () => ({
    getUserIdFromToken: vi.fn(),
}));

vi.mock("@/lib/server/cached-services", () => ({
    getUserListService: vi.fn(),
}));

afterEach(() => {
    vi.clearAllMocks();
});

test("사용자 목록 로더는 목록 조회 예외를 실패 상태로 정규화한다", async () => {
    vi.mocked(getUserListService).mockRejectedValue(new Error("network error"));
    vi.mocked(getAccessTokenFromServerCookie).mockResolvedValue("access-token");
    vi.mocked(getUserIdFromToken).mockReturnValue(7);

    const result = await loadUserListViewModel();

    expect(result).toEqual({
        users: [],
        currentUserId: 7,
        loadFailed: true,
    });
});

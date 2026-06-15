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

test("사용자 목록 view model은 토큰 식별값이 null이면 currentUserId를 null로 유지한다", async () => {
    vi.mocked(getUserListService).mockResolvedValue({
        isSuccess: true,
        result: [],
    });
    vi.mocked(getAccessTokenFromServerCookie).mockResolvedValue("access-token");
    vi.mocked(getUserIdFromToken).mockReturnValue(null);

    const result = await loadUserListViewModel();

    expect(result.currentUserId).toBeNull();
    expect(result.loadFailed).toBe(false);
});

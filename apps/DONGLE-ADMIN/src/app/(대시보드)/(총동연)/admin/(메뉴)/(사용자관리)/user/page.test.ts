import { afterEach, expect, test, vi } from "vitest";
import { requireAdminPageAccess } from "@/shared/action/server-page-auth";
import { getUserListService } from "@/lib/server/cached-services";
import { loadUserListViewModel } from "./user-list-view-model";

vi.mock("@/shared/action/server-page-auth", () => ({
    requireAdminPageAccess: vi.fn(),
}));

vi.mock("@/lib/server/cached-services", () => ({
    getUserListService: vi.fn(),
}));

afterEach(() => {
    vi.clearAllMocks();
});

test("사용자 목록 로더는 목록 조회 예외를 실패 상태로 정규화한다", async () => {
    vi.mocked(getUserListService).mockRejectedValue(new Error("network error"));
    vi.mocked(requireAdminPageAccess).mockResolvedValue({ accessToken: "access-token", claims: { role: "admin", sub: 7 } });

    const result = await loadUserListViewModel();

    expect(result).toEqual({
        users: [],
        currentUserId: 7,
        loadFailed: true,
    });
});

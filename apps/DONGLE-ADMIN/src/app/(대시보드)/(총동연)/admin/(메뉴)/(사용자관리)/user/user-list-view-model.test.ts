import { beforeEach, expect, test, vi } from "vitest";
import type { User } from "@dongle/types/user/user";
import { requireAdminPageAccess } from "@/shared/action/server-page-auth";
import { getUserListService } from "@/lib/server/cached-services";
import { loadUserListViewModel } from "./user-list-view-model";

vi.mock("@/shared/action/server-page-auth", () => ({
    requireAdminPageAccess: vi.fn().mockResolvedValue({ accessToken: "access-token", claims: { role: "admin", user_id: null } }),
}));

vi.mock("@/lib/server/cached-services", () => ({
    getUserListService: vi.fn(),
}));

beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(requireAdminPageAccess).mockResolvedValue({ accessToken: "access-token", claims: { role: "admin" } });
});

test("사용자 목록 view model은 토큰 식별값이 null이면 currentUserId를 null로 유지한다", async () => {
    vi.mocked(getUserListService).mockResolvedValue({
        isSuccess: true,
        result: [],
    });
    const result = await loadUserListViewModel();

    expect(result.currentUserId).toBeNull();
    expect(result.loadFailed).toBe(false);
    expect(requireAdminPageAccess).toHaveBeenCalledTimes(1);
});

test("관리자 권한 확인 실패 시 사용자 목록을 불러오지 않는다", async () => {
    vi.mocked(requireAdminPageAccess).mockRejectedValue(new Error("redirect:/login?reason=unauthorized"));

    await expect(loadUserListViewModel()).rejects.toThrow("redirect:/login?reason=unauthorized");
    expect(getUserListService).not.toHaveBeenCalled();
});

test("현재 사용자 ID는 검증된 claim의 user_id를 우선 사용한다", async () => {
    vi.mocked(requireAdminPageAccess).mockResolvedValue({
        accessToken: "access-token",
        claims: { role: "admin", user_id: "7", sub: "8" },
    });
    vi.mocked(getUserListService).mockResolvedValue({ isSuccess: true, result: [] });

    const result = await loadUserListViewModel();

    expect(result.currentUserId).toBe(7);
});

test("구버전 API 사용자 응답의 password와 refresh_token은 client prop에서 제외한다", async () => {
    const legacyUser = {
        id: 4,
        name: "회장",
        login_id: "president",
        role: "president",
        phone: "010-1234-5678",
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-02T00:00:00.000Z",
        deleted_at: null,
        club: { id: 11, name: "동아리", hidden: "internal" },
        password: "legacy-hash",
        refresh_token: "legacy-token",
    } as User & { password: string; refresh_token: string };
    vi.mocked(getUserListService).mockResolvedValue({ isSuccess: true, result: [legacyUser] });

    const result = await loadUserListViewModel();

    expect(result.users).toEqual([
        {
            id: 4,
            name: "회장",
            login_id: "president",
            role: "president",
            phone: "010-1234-5678",
            created_at: "2026-01-01T00:00:00.000Z",
            updated_at: "2026-01-02T00:00:00.000Z",
            deleted_at: null,
            club: { id: 11, name: "동아리" },
        },
    ]);
});

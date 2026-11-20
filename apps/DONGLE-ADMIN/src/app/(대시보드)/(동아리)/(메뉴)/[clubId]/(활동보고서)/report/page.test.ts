import { afterEach, expect, test, vi } from "vitest";
import { getClubReportListService } from "@/lib/server/cached-services";
import { loadClubReportListViewModel } from "./club-report-list-view-model";
import { requireClubPageAccess } from "@/shared/action/server-page-auth";

vi.mock("@/shared/action/server-page-auth", () => ({
    requireClubPageAccess: vi.fn().mockResolvedValue({ accessToken: "token", claims: { role: "president", club_id: 3 } }),
}));

vi.mock("@/lib/server/cached-services", () => ({
    getClubReportListService: vi.fn(),
}));

afterEach(() => {
    vi.clearAllMocks();
});

test("회장 활동보고서 목록 로더는 목록 조회 예외를 실패 상태로 정규화한다", async () => {
    vi.mocked(getClubReportListService).mockRejectedValue(new Error("network error"));

    const result = await loadClubReportListViewModel("3");

    expect(result).toEqual({
        reports: [],
        loadFailed: true,
    });
    expect(requireClubPageAccess).toHaveBeenCalledWith({ clubId: "3" });
});

test("동아리 권한 거부는 목록 실패 상태로 삼키지 않고 데이터 조회 전에 전파한다", async () => {
    vi.mocked(requireClubPageAccess).mockRejectedValueOnce(new Error("redirect:/login?reason=unauthorized_club"));

    await expect(loadClubReportListViewModel("4")).rejects.toThrow("redirect:/login?reason=unauthorized_club");
    expect(getClubReportListService).not.toHaveBeenCalled();
});

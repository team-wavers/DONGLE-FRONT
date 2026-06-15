import { afterEach, expect, test, vi } from "vitest";
import { getClubReportListService } from "@/lib/server/cached-services";
import { loadClubReportListViewModel } from "./club-report-list-view-model";

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
});

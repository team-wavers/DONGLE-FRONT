import { afterEach, describe, expect, test, vi } from "vitest";
import {
    getClubReportListService,
    getClubReportService,
    getClubService,
} from "@/lib/server/cached-services";
import { notFound } from "next/navigation";
import ClubReportDetailPage from "./page";

vi.mock("@/lib/server/cached-services", () => ({
    getClubService: vi.fn(),
    getClubReportListService: vi.fn(),
    getClubReportService: vi.fn(),
}));

vi.mock("next/navigation", () => ({
    notFound: vi.fn(() => {
        throw new Error("NEXT_NOT_FOUND");
    }),
}));

const params = Promise.resolve({ clubId: "1", reportId: "2" });

afterEach(() => {
    vi.clearAllMocks();
});

describe("ClubReportDetailPage 오류 분기", () => {
    test("보고서 목록 실패는 404로 숨기지 않고 throw한다", async () => {
        vi.mocked(getClubService).mockResolvedValue({ isSuccess: true, result: { id: 1, name: "UCDC" } } as never);
        vi.mocked(getClubReportListService).mockResolvedValue({
            isSuccess: false,
            error: { message: "목록 실패", detail: "server error", status: 500 },
        });
        vi.mocked(getClubReportService).mockResolvedValue({ isSuccess: true, result: { id: 2 } } as never);

        await expect(ClubReportDetailPage({ params })).rejects.toThrow("활동보고서 목록을 불러오지 못했습니다.");
        expect(notFound).not.toHaveBeenCalled();
    });

    test("보고서 단건 404는 notFound로 분기한다", async () => {
        vi.mocked(getClubService).mockResolvedValue({ isSuccess: true, result: { id: 1, name: "UCDC" } } as never);
        vi.mocked(getClubReportListService).mockResolvedValue({ isSuccess: true, result: [] });
        vi.mocked(getClubReportService).mockResolvedValue({
            isSuccess: false,
            error: { message: "Not Found", detail: "report_id: 2", status: 404 },
        });

        await expect(ClubReportDetailPage({ params })).rejects.toThrow("NEXT_NOT_FOUND");
        expect(notFound).toHaveBeenCalledOnce();
    });

    test("보고서 단건 5xx는 notFound로 숨기지 않고 throw한다", async () => {
        vi.mocked(getClubService).mockResolvedValue({ isSuccess: true, result: { id: 1, name: "UCDC" } } as never);
        vi.mocked(getClubReportListService).mockResolvedValue({ isSuccess: true, result: [] });
        vi.mocked(getClubReportService).mockResolvedValue({
            isSuccess: false,
            error: { message: "Server Error", detail: "backend unavailable", status: 503 },
        });

        await expect(ClubReportDetailPage({ params })).rejects.toThrow("활동보고서를 불러오지 못했습니다.");
        expect(notFound).not.toHaveBeenCalled();
    });
});

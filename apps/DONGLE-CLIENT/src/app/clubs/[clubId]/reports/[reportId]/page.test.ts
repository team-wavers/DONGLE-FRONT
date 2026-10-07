import { afterEach, describe, expect, test, vi } from "vitest";
import {
    getClubReportListService,
    getClubReportService,
    getClubService,
} from "@/lib/server/cached-services";
import { notFound } from "next/navigation";
import ClubReportDetailPage from "./page";
import { renderToStaticMarkup } from "react-dom/server";

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

vi.mock("./_components/report-image-gallery", () => ({ default: () => null }));
vi.mock("./_components/club-summary-card", () => ({ default: () => null }));
vi.mock("./_components/other-report-list", () => ({ default: () => null }));

const params = Promise.resolve({ clubId: "1", reportId: "2" });

afterEach(() => {
    vi.clearAllMocks();
});

describe("ClubReportDetailPage 서버 본문", () => {
    test("서버에서 받은 본문이 JavaScript 실행 없이 HTML에 포함되고 위험한 마크업은 제거된다", async () => {
        vi.mocked(getClubService).mockResolvedValue({ isSuccess: true, result: { id: 1, name: "UCDC" } } as never);
        vi.mocked(getClubReportListService).mockResolvedValue({ isSuccess: true, result: [] });
        vi.mocked(getClubReportService).mockResolvedValue({
            isSuccess: true,
            result: {
                id: 2,
                club_id: 1,
                title: "정기 공연",
                content: '<p>공연 <strong>활동 기록</strong></p><script>alert("unsafe")</script><img src="/report.jpg" onerror="alert(1)"><a href="javascript:alert(2)">링크</a>',
                createdAt: "2026-03-01T00:00:00.000Z",
                updatedAt: "2026-03-01T00:00:00.000Z",
                deletedAt: null,
                image_urls: [],
            },
        });

        const page = await ClubReportDetailPage({ params });
        const html = renderToStaticMarkup(page);

        expect(getClubReportService).toHaveBeenCalledWith(1, 2);
        expect(html).toContain("공연 <strong>활동 기록</strong>");
        expect(html).not.toContain("<script");
        expect(html).not.toContain("onerror");
        expect(html).not.toContain("javascript:");
        expect(html).not.toContain('alert("unsafe")');
    }, 30_000); // 실제 sanitizer의 첫 JSDOM 로딩 시간을 포함하는 통합 검증
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

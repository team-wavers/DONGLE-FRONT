import { afterEach, describe, expect, it, vi } from "vitest";
import {
    getClubListService,
    getClubReportListService,
    getRecentClubReportsService,
} from "@/lib/server/cached-services";
import { loadHomeActivityReports } from "./home-activity-data";

vi.mock("@/lib/server/cached-services", () => ({
    getClubListService: vi.fn(),
    getClubReportListService: vi.fn(),
    getRecentClubReportsService: vi.fn(),
}));

afterEach(() => vi.resetAllMocks());

describe("통합 API 홈 활동 로더", () => {
    it("공개 통합 API 한 번으로 카드 모델을 만들고 동아리별 요청을 보내지 않는다", async () => {
        vi.mocked(getRecentClubReportsService).mockResolvedValue({
            isSuccess: true,
            result: [
                {
                    id: 178,
                    title: "10월 활동보고서",
                    createdAt: "2026-11-10T00:00:00Z",
                    club_id: 2,
                    club_name: "스파이크",
                    thumbnail_url: "https://example.com/activity.jpg",
                },
            ],
        });
        await expect(loadHomeActivityReports()).resolves.toEqual([
            {
                reportId: 178,
                clubId: 2,
                clubName: "스파이크",
                title: "10월 활동보고서",
                createdAt: "2026-11-10T00:00:00Z",
                thumbnailUrl: "https://example.com/activity.jpg",
            },
        ]);
        expect(getRecentClubReportsService).toHaveBeenCalledTimes(1);
        expect(getClubListService).not.toHaveBeenCalled();
        expect(getClubReportListService).not.toHaveBeenCalled();
    });

    it("사진 없는 소식과 서버가 결정한 순서를 그대로 유지한다", async () => {
        vi.mocked(getRecentClubReportsService).mockResolvedValue({
            isSuccess: true,
            result: [
                {
                    id: 4,
                    title: "네 번째 소식",
                    createdAt: "2026-11-10T00:00:00Z",
                    club_id: 3,
                    club_name: "하늘",
                    thumbnail_url: null,
                },
                {
                    id: 2,
                    title: "두 번째 소식",
                    createdAt: "2026-11-09T00:00:00Z",
                    club_id: 2,
                    club_name: "스파이크",
                    thumbnail_url: null,
                },
            ],
        });
        const result = await loadHomeActivityReports();
        expect(result.map(({ reportId }) => reportId)).toEqual([4, 2]);
        expect(result.every(({ thumbnailUrl }) => thumbnailUrl === null)).toBe(true);
    });

    it.each(["실패 응답", "네트워크 예외"])(
        "통합 API %s이면 빈 소식으로 정규화하고 fan-out으로 우회하지 않는다",
        async (mode) => {
            if (mode === "실패 응답")
                vi.mocked(getRecentClubReportsService).mockResolvedValue({
                    isSuccess: false,
                    error: { message: "조회 실패", detail: "" },
                });
            else vi.mocked(getRecentClubReportsService).mockRejectedValue(new Error("network error"));
            await expect(loadHomeActivityReports()).resolves.toEqual([]);
            expect(getClubListService).not.toHaveBeenCalled();
            expect(getClubReportListService).not.toHaveBeenCalled();
        }
    );

    it("빈 최근 활동은 빈 카드 목록을 반환한다", async () => {
        vi.mocked(getRecentClubReportsService).mockResolvedValue({ isSuccess: true, result: [] });
        await expect(loadHomeActivityReports()).resolves.toEqual([]);
    });
});

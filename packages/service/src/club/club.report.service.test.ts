import { beforeEach, describe, expect, test, vi } from "vitest";

const fetchInstanceMock = vi.hoisted(() => ({
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
}));

vi.mock("@dongle/api/instance", () => ({
    default: {
        getInstance: () => fetchInstanceMock,
    },
}));

import { getClubReportListService, getClubReportService } from "./club.report.service";

describe("club report service endpoints", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        fetchInstanceMock.get.mockResolvedValue({
            isSuccess: true,
            result: [],
        });
    });

    test("활동보고서 목록은 목록 엔드포인트를 호출한다", async () => {
        await getClubReportListService(1);

        expect(fetchInstanceMock.get).toHaveBeenCalledWith("/clubs/1/reports", {
            next: {
                tags: ["report", "report-1"],
            },
        });
    });

    test("활동보고서 단건은 단건 엔드포인트를 no-store로 호출한다", async () => {
        fetchInstanceMock.get.mockResolvedValueOnce({
            isSuccess: true,
            result: { id: 3, club_id: 1, title: "활동보고서" },
        });

        const result = await getClubReportService(1, 3);

        expect(fetchInstanceMock.get).toHaveBeenCalledWith("/clubs/1/reports/3", {
            cache: "no-store",
        });
        expect(result).toEqual({
            isSuccess: true,
            result: { id: 3, club_id: 1, title: "활동보고서" },
        });
    });

    test("활동보고서 단건이 없으면 404 예외를 실패 응답으로 정규화한다", async () => {
        fetchInstanceMock.get.mockRejectedValueOnce(new Error("HTTP 404: Not Found"));

        const result = await getClubReportService(1, 999);

        expect(result).toEqual({
            isSuccess: false,
            error: {
                message: "해당 활동보고서를 찾을 수 없습니다.",
                detail: "report_id: 999",
            },
        });
    });

    test("활동보고서 단건 조회의 404 외 예외는 다시 던진다", async () => {
        const error = new Error("Internal Server Error");
        fetchInstanceMock.get.mockRejectedValueOnce(error);

        await expect(getClubReportService(1, 999)).rejects.toBe(error);
    });
});

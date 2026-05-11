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
});

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
            cache: "force-cache",
            next: {
                tags: ["report", "report-club-1"],
                revalidate: 60,
            },
        });
    });

    test("관리자 활동보고서 목록은 no-store로 호출한다", async () => {
        await getClubReportListService(1, "admin");

        expect(fetchInstanceMock.get).toHaveBeenCalledWith("/clubs/1/reports", {
            cache: "no-store",
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

    test("활동보고서 단건이 없으면 status 404 실패 응답을 반환한다", async () => {
        fetchInstanceMock.get.mockResolvedValueOnce({
            isSuccess: false,
            error: {
                message: "해당 활동보고서가 존재하지 않습니다.",
                detail: "report_id: 999",
                status: 404,
            },
        });

        const result = await getClubReportService(1, 999);

        expect(result).toEqual({
            isSuccess: false,
            error: {
                message: "해당 활동보고서가 존재하지 않습니다.",
                detail: "report_id: 999",
                status: 404,
            },
        });
    });

    test("활동보고서 단건 조회는 API 문서 404 문구와 함께 status 404를 유지한다", async () => {
        fetchInstanceMock.get.mockResolvedValueOnce({
            isSuccess: false,
            error: {
                message: "해당 활동보고서가 존재하지 않습니다.",
                detail: "Not Found",
                status: 404,
            },
        });

        const result = await getClubReportService(1, 999);

        expect(result).toEqual({
            isSuccess: false,
            error: {
                message: "해당 활동보고서가 존재하지 않습니다.",
                detail: "Not Found",
                status: 404,
            },
        });
    });

    test("활동보고서 단건 조회의 서버 실패는 throw되지 않고 실패 응답으로 반환된다", async () => {
        fetchInstanceMock.get.mockResolvedValueOnce({
            isSuccess: false,
            error: {
                message: "HTTP 500: Internal Server Error",
                detail: "server_error",
            },
        });

        const result = await getClubReportService(1, 999);

        expect(result).toEqual({
            isSuccess: false,
            error: {
                message: "HTTP 500: Internal Server Error",
                detail: "server_error",
            },
        });
    });
});

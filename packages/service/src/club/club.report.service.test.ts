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

import type { ClubReportResponse } from "@dongle/types/club/club.report";
import { getClubReportListService, getClubReportService, isClubReportNotFoundResponse } from "./club.report.service";

const successfulClubReportResponse: ClubReportResponse = {
    isSuccess: true,
    result: {
        id: 3,
        club_id: 1,
        title: "활동보고서",
        content: "내용",
        image_urls: [],
        createdAt: "2026-06-17T00:00:00.000Z",
        updatedAt: "2026-06-17T00:00:00.000Z",
        deletedAt: null,
    },
};

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

    test("활동보고서 단건 조회의 API 문서 404 문구도 실패 응답으로 정규화한다", async () => {
        fetchInstanceMock.get.mockRejectedValueOnce(new Error("해당 활동보고서가 존재하지 않습니다."));

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

describe("isClubReportNotFoundResponse", () => {
    test("실패 응답 detail에 report_id가 포함되면 not-found로 판별한다", () => {
        expect(
            isClubReportNotFoundResponse({
                isSuccess: false,
                error: {
                    message: "해당 활동보고서를 찾을 수 없습니다.",
                    detail: "report_id: 999",
                },
            })
        ).toBe(true);
    });

    test("실패 응답 message에 찾을 수 없음 문구가 포함되면 not-found로 판별한다", () => {
        expect(
            isClubReportNotFoundResponse({
                isSuccess: false,
                error: {
                    message: "해당 활동보고서를 찾을 수 없습니다.",
                    detail: "Not Found",
                },
            })
        ).toBe(true);
        expect(
            isClubReportNotFoundResponse({
                isSuccess: false,
                error: {
                    message: "해당 활동보고서가 존재하지 않습니다.",
                    detail: "Not Found",
                },
            })
        ).toBe(true);
        expect(
            isClubReportNotFoundResponse({
                isSuccess: false,
                error: {
                    message: "report not found",
                    detail: "Not Found",
                },
            })
        ).toBe(true);
    });

    test("성공 응답은 not-found로 판별하지 않는다", () => {
        expect(isClubReportNotFoundResponse(successfulClubReportResponse)).toBe(false);
    });

    test("무관한 실패 응답은 not-found로 판별하지 않는다", () => {
        expect(
            isClubReportNotFoundResponse({
                isSuccess: false,
                error: {
                    message: "Internal Server Error",
                    detail: "server_error",
                },
            })
        ).toBe(false);
    });
});

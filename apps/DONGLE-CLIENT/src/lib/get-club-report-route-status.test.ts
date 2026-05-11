import { describe, expect, it } from "vitest";
import { getClubReportRouteStatus } from "@/lib/get-club-report-route-status";

describe("getClubReportRouteStatus", () => {
    it("성공 응답은 200을 반환한다", () => {
        expect(
            getClubReportRouteStatus({
                isSuccess: true,
                result: {
                    id: 1,
                    club_id: 1,
                    title: "활동 보고서",
                    content: "<p>내용</p>",
                    createdAt: "2026-04-20T00:00:00.000Z",
                    updatedAt: "2026-04-20T00:00:00.000Z",
                    deletedAt: null,
                    image_urls: [],
                },
            })
        ).toBe(200);
    });

    it("보고서가 없으면 404를 반환한다", () => {
        expect(
            getClubReportRouteStatus({
                isSuccess: false,
                error: {
                    message: "해당 활동보고서를 찾을 수 없습니다.",
                    detail: "report_id: 999",
                },
            })
        ).toBe(404);
    });

    it("상세 조회 실패는 502를 반환한다", () => {
        expect(
            getClubReportRouteStatus({
                isSuccess: false,
                error: {
                    message: "활동 보고서를 가져오는데 실패했습니다.",
                    detail: "upstream error",
                },
            })
        ).toBe(502);
    });
});

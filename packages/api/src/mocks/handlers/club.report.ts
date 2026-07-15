import { http, HttpResponse } from "msw";
import type {
    ClubReport,
    ClubReportCreateResponse,
    ClubReportDeleteResponse,
    ClubReportImageResponse,
    ClubReportListResponse,
    ClubReportResponse,
    ClubReportUpdateResponse,
    CreateClubReportRequest,
    UpdateClubReportRequest,
} from "@dongle/types/club/club.report";
import type { SuccessResponse } from "@dongle/types/response";
import { apiPath } from "../api-path";
import { mockReportsForClub } from "../fixtures";

function success<T>(result: T): SuccessResponse<T> {
    return { isSuccess: true, result };
}

const clubReportHandlers = [
    http.get(apiPath(`/clubs/:clubId/reports`), ({ params }) => {
        const body: ClubReportListResponse = success(mockReportsForClub(Number(params.clubId)));
        return HttpResponse.json(body);
    }),

    http.get(apiPath(`/clubs/:clubId/reports/:reportId`), ({ params }) => {
        const clubId = Number(params.clubId);
        const reportId = Number(params.reportId);
        const existing = mockReportsForClub(clubId).find((report) => report.id === reportId);

        const report: ClubReport = existing ?? {
            id: reportId,
            content: "D-Maker의 첫 번째 활동보고서입니다. React 스터디를 진행했습니다.",
            image_urls: [
                "https://s3.ap-northeast-2.amazonaws.com/dongle-mock/photo-1555066931-4365d14bab8c?w=500",
                "https://s3.ap-northeast-2.amazonaws.com/dongle-mock/photo-1551650975-87deedd944c3?w=500",
            ],
            title: "React 스터디 활동보고서",
            createdAt: "2024-07-15T10:00:00Z",
            updatedAt: "2024-07-15T10:00:00Z",
            deletedAt: null,
            club_id: clubId,
        };

        const body: ClubReportResponse = success(report);
        return HttpResponse.json(body);
    }),

    http.post(apiPath(`/clubs/:clubId/reports`), async ({ request, params }) => {
        const body = (await request.json()) as CreateClubReportRequest;

        const newReport: ClubReport = {
            id: Math.floor(Math.random() * 1000) + 100,
            content: body.content,
            image_urls: body.image_urls ?? [],
            title: body.title,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deletedAt: null,
            club_id: Number(params.clubId),
        };

        const response: ClubReportCreateResponse = success(newReport);
        return HttpResponse.json(response, { status: 201 });
    }),

    http.put(apiPath(`/clubs/:clubId/reports/:reportId`), async ({ request, params }) => {
        const body = (await request.json()) as UpdateClubReportRequest;
        const clubId = Number(params.clubId);
        const reportId = Number(params.reportId);
        const current =
            mockReportsForClub(clubId).find((report) => report.id === reportId) ??
            mockReportsForClub(clubId)[0];

        const updatedReport: ClubReport = {
            ...current,
            id: reportId,
            content: body.content ?? current.content,
            image_urls: body.image_urls ?? current.image_urls,
            title: body.title ?? current.title,
            updatedAt: new Date().toISOString(),
            club_id: clubId,
        };

        const response: ClubReportUpdateResponse = success(updatedReport);
        return HttpResponse.json(response);
    }),

    http.delete(apiPath(`/clubs/:clubId/reports/:reportId`), () => {
        const body: ClubReportDeleteResponse = success(null);
        return HttpResponse.json(body);
    }),

    http.post(apiPath(`/clubs/:clubId/report-images`), async ({ request }) => {
        let file: File | null = null;

        try {
            const formData = await request.formData();
            file = formData.get("file") as File | null;
        } catch {
            file = null;
        }

        void file;

        const imageUrl = `https://s3.ap-northeast-2.amazonaws.com/dongle-mock/photo-${Math.floor(Math.random() * 1000000000)}?w=500`;
        const body: ClubReportImageResponse = success(imageUrl);
        return HttpResponse.json(body);
    }),
];

export default clubReportHandlers;

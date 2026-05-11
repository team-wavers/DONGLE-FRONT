import FetchInstance from "@dongle/api/instance";
import type {
    ClubReportCreateResponse,
    ClubReportImageResponse,
    ClubReportListResponse,
    ClubReportResponse,
    ClubReportUpdateResponse,
    CreateClubReportRequest,
    UpdateClubReportRequest,
} from "@dongle/types/club/club.report";
import type { Response } from "@dongle/types/response";

const instance = FetchInstance.getInstance();

const CLUBS_PATH = "/clubs";
const REPORT_TAG = "report";

function getClubReportsPath(clubId: number) {
    return `${CLUBS_PATH}/${clubId}/reports`;
}

function getClubReportPath(clubId: number, reportId: number) {
    return `${getClubReportsPath(clubId)}/${reportId}`;
}

function getClubReportImagePath(clubId: number) {
    return `${CLUBS_PATH}/${clubId}/report-images`;
}

function getReportTags(clubId: number, reportId?: number) {
    return reportId
        ? [REPORT_TAG, `${REPORT_TAG}-${clubId}`, `${REPORT_TAG}-${reportId}`]
        : [REPORT_TAG, `${REPORT_TAG}-${clubId}`];
}

function isClubReportNotFoundError(error: unknown): boolean {
    if (!(error instanceof Error)) {
        return false;
    }

    const message = error.message.toLowerCase();

    return (
        message.includes("404") ||
        message.includes("not found") ||
        message.includes("report_id:") ||
        message.includes("활동보고서를 찾을 수 없습니다")
    );
}

function createClubReportNotFoundResponse(reportId: number): ClubReportResponse {
    return {
        isSuccess: false,
        error: {
            message: "해당 활동보고서를 찾을 수 없습니다.",
            detail: `report_id: ${reportId}`,
        },
    };
}

export async function getClubReportListService(clubId: number): Promise<ClubReportListResponse> {
    const response = await instance.get(getClubReportsPath(clubId), {
        next: {
            tags: getReportTags(clubId),
        },
    });
    return response as ClubReportListResponse;
}

export async function getClubReportService(clubId: number, reportId: number): Promise<ClubReportResponse> {
    try {
        const response = await instance.get(getClubReportPath(clubId, reportId), {
            cache: "no-store",
        });
        return response as ClubReportResponse;
    } catch (error) {
        if (isClubReportNotFoundError(error)) {
            return createClubReportNotFoundResponse(reportId);
        }

        throw error;
    }
}

export async function createClubReportService(
    clubId: number,
    report: CreateClubReportRequest
): Promise<ClubReportCreateResponse> {
    const response = await instance.post(getClubReportsPath(clubId), report, {
        next: {
            tags: getReportTags(clubId),
        },
    });
    return response as ClubReportCreateResponse;
}

export async function updateClubReportService(
    clubId: number,
    reportId: number,
    report: UpdateClubReportRequest
): Promise<ClubReportUpdateResponse> {
    const response = await instance.put(getClubReportPath(clubId, reportId), report, {
        next: {
            tags: getReportTags(clubId, reportId),
        },
    });
    return response as ClubReportUpdateResponse;
}

export async function deleteClubReportService(clubId: number, reportId: number): Promise<Response<null>> {
    const response = await instance.delete(getClubReportPath(clubId, reportId), {
        next: {
            tags: getReportTags(clubId, reportId),
        },
    });
    return response as Response<null>;
}

export async function uploadClubReportImageService(clubId: number, image: File): Promise<ClubReportImageResponse> {
    const formData = new FormData();
    formData.append("file", image);

    const response = await instance.post(getClubReportImagePath(clubId), formData);
    return response as ClubReportImageResponse;
}

import FetchInstance from "@dongle/api/instance";
import type { FetchOptions } from "@dongle/api/fetch-types";
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
import { PUBLIC_REVALIDATE_SECONDS, reportTagGroups } from "../cache-tags";

const instance = FetchInstance.getInstance();

const CLUBS_PATH = "/clubs";

export type ReportFetchPolicy = "public" | "admin";

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
    return reportId ? reportTagGroups.item(clubId, reportId) : reportTagGroups.club(clubId);
}

function getReportListFetchOptions(clubId: number, policy: ReportFetchPolicy = "public"): FetchOptions {
    if (policy === "admin") {
        return {
            cache: "no-store",
        };
    }

    return {
        cache: "force-cache",
        next: {
            tags: getReportTags(clubId),
            revalidate: PUBLIC_REVALIDATE_SECONDS,
        },
    };
}

export function isClubReportNotFoundResponse(response: ClubReportResponse): boolean {
    if (response.isSuccess) {
        return false;
    }

    const detail = response.error.detail.toLowerCase();
    const message = response.error.message.toLowerCase();

    return (
        detail.includes("report_id:") ||
        message.includes("찾을 수 없습니다") ||
        message.includes("존재하지 않습니다") ||
        message.includes("not found")
    );
}

export async function getClubReportListService(
    clubId: number,
    policy: ReportFetchPolicy = "public"
): Promise<ClubReportListResponse> {
    return instance.get<ClubReportListResponse>(getClubReportsPath(clubId), getReportListFetchOptions(clubId, policy));
}

export async function getClubReportService(clubId: number, reportId: number): Promise<ClubReportResponse> {
    return instance.get<ClubReportResponse>(getClubReportPath(clubId, reportId), {
        cache: "no-store",
    });
}

export async function createClubReportService(
    clubId: number,
    report: CreateClubReportRequest
): Promise<ClubReportCreateResponse> {
    return instance.post<ClubReportCreateResponse>(getClubReportsPath(clubId), report);
}

export async function updateClubReportService(
    clubId: number,
    reportId: number,
    report: UpdateClubReportRequest
): Promise<ClubReportUpdateResponse> {
    return instance.put<ClubReportUpdateResponse>(getClubReportPath(clubId, reportId), report);
}

export async function deleteClubReportService(clubId: number, reportId: number): Promise<Response<null>> {
    return instance.delete<Response<null>>(getClubReportPath(clubId, reportId));
}

export async function uploadClubReportImageService(clubId: number, image: File): Promise<ClubReportImageResponse> {
    const formData = new FormData();
    formData.append("file", image);

    return instance.post<ClubReportImageResponse>(getClubReportImagePath(clubId), formData);
}

import FetchInstance from "@dongle/api/instance";
import {
    ClubReportResponse,
    CreateClubReportRequest,
    ClubReportImageResponse,
    UpdateClubReportRequest,
    ClubReportUpdateResponse,
    ClubReportCreateResponse,
    ClubReportListResponse,
    ClubReport,
} from "@dongle/types/club/club.report";
import { Response } from "@dongle/types/response";

const instance = FetchInstance.getInstance();

export const getClubReportListService = async (club_id: number): Promise<ClubReportListResponse> => {
    const response = await instance.get(`/clubs/${club_id}/reports`, {
        next: {
            tags: ["report", `report-${club_id}`],
        },
    });
    return response as ClubReportListResponse;
};

// 캐시된 목록에서 특정 보고서 찾기 (더 효율적)
export const getClubReportFromListService = async (club_id: number, report_id: number): Promise<ClubReportResponse> => {
    // 목록을 가져옴 (캐시에서 가져올 가능성이 높음)
    const { result: reportList, isSuccess } = await getClubReportListService(club_id);

    if (!isSuccess || !reportList) {
        return {
            isSuccess: false,
            error: {
                message: "활동 보고서를 가져오는데 실패했습니다.",
                detail: "목록 API 호출 실패",
            },
        };
    }

    // 특정 보고서 찾기
    const report = reportList.find((r: ClubReport) => r.id === report_id);

    if (!report) {
        return {
            isSuccess: false,
            error: {
                message: "해당 활동보고서를 찾을 수 없습니다.",
                detail: `report_id: ${report_id}`,
            },
        };
    }

    return {
        isSuccess: true,
        result: report,
    };
};

export const createClubReportService = async (
    club_id: number,
    report: CreateClubReportRequest
): Promise<ClubReportCreateResponse> => {
    const response = await instance.post(`/clubs/${club_id}/reports`, report, {
        next: {
            tags: ["report", `report-${club_id}`],
        },
    });
    return response as ClubReportCreateResponse;
};

export const updateClubReportService = async (
    club_id: number,
    report_id: number,
    report: UpdateClubReportRequest
): Promise<ClubReportUpdateResponse> => {
    const response = await instance.put(`/clubs/${club_id}/reports/${report_id}`, report, {
        next: {
            tags: ["report", `report-${club_id}`],
        },
    });
    return response as ClubReportUpdateResponse;
};

/** 활동 보고서 삭제 */
export const deleteClubReportService = async (club_id: number, report_id: number): Promise<Response<null>> => {
    const response = await instance.delete(`/clubs/${club_id}/reports/${report_id}`, {
        next: {
            tags: ["report", `report-${club_id}`],
        },
    });
    return response as Response<null>;
};

export const uploadClubReportImageService = async (club_id: number, image: File): Promise<ClubReportImageResponse> => {
    const formData = new FormData();
    formData.append("file", image);

    const response = await instance.post(`/clubs/${club_id}/report-images`, formData);
    return response as ClubReportImageResponse;
};

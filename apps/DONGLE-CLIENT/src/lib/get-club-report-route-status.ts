import type { ClubReportResponse } from "@dongle/types/club/club.report";

export function getClubReportRouteStatus(response: ClubReportResponse) {
    if (response.isSuccess) {
        return 200;
    }

    if (response.error.detail.startsWith("report_id:")) {
        return 404;
    }

    return 502;
}

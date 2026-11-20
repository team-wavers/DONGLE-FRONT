import { getRecentClubReportsService } from "@/lib/server/cached-services";
import type { HomeActivityReport } from "@/lib/home-activity-reports";

export async function loadHomeActivityReports(): Promise<HomeActivityReport[]> {
    const response = await getRecentClubReportsService().catch(() => null);
    if (!response?.isSuccess || !response.result) return [];

    return response.result.map((report) => ({
        reportId: report.id,
        clubId: report.club_id,
        clubName: report.club_name,
        title: report.title,
        createdAt: report.createdAt,
        thumbnailUrl: report.thumbnail_url,
    }));
}

import { getClubListService, getClubReportListService } from "@/lib/server/cached-services";
import { selectHomeActivityReports, type HomeActivityReportSource } from "@/lib/home-activity-reports";

const MAX_CONCURRENT_REPORT_REQUESTS = 6;

export async function loadHomeActivityReports() {
    const response = await getClubListService().catch(() => null);
    if (!response?.isSuccess || !response.result?.length) return [];

    const clubs = response.result;
    const sources: HomeActivityReportSource[] = [];
    let nextClubIndex = 0;

    async function loadNextClubs() {
        while (nextClubIndex < clubs.length) {
            const club = clubs[nextClubIndex++];
            const reports = await getClubReportListService(club.id).catch(() => null);

            if (reports?.isSuccess && reports.result) {
                sources.push({ clubId: club.id, clubName: club.name, reports: reports.result });
            }
        }
    }

    await Promise.all(
        Array.from({ length: Math.min(MAX_CONCURRENT_REPORT_REQUESTS, clubs.length) }, () => loadNextClubs())
    );

    return selectHomeActivityReports(sources);
}

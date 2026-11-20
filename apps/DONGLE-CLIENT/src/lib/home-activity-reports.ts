import type { ClubReport } from "@dongle/types/club/club.report";
import { resolveReportThumbnailUrl } from "./report-thumbnail";

export type HomeActivityReport = {
    reportId: number;
    clubId: number;
    clubName: string;
    title: string;
    createdAt: string;
    thumbnailUrl: string | null;
};

export type HomeActivityReportSource = {
    clubId: number;
    clubName: string;
    reports: ClubReport[];
};

const HOME_ACTIVITY_REPORT_LIMIT = 4;

export function selectHomeActivityReports(sources: HomeActivityReportSource[]): HomeActivityReport[] {
    const latestByClub = new Map<number, { report: ClubReport; source: HomeActivityReportSource; timestamp: number }>();

    for (const source of sources) {
        for (const report of source.reports) {
            if (report.deletedAt) continue;

            const timestamp = Date.parse(report.createdAt);
            if (!Number.isFinite(timestamp)) continue;

            const latest = latestByClub.get(source.clubId);
            if (
                !latest ||
                timestamp > latest.timestamp ||
                (timestamp === latest.timestamp && report.id > latest.report.id)
            ) {
                latestByClub.set(source.clubId, { report, source, timestamp });
            }
        }
    }

    return [...latestByClub.values()]
        .sort((left, right) => right.timestamp - left.timestamp || right.report.id - left.report.id)
        .slice(0, HOME_ACTIVITY_REPORT_LIMIT)
        .map(({ report, source }) => ({
            reportId: report.id,
            clubId: source.clubId,
            clubName: source.clubName,
            title: report.title,
            createdAt: report.createdAt,
            thumbnailUrl: resolveReportThumbnailUrl(report.image_urls, report.content),
        }));
}

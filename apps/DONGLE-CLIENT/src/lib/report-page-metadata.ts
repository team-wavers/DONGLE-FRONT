import { buildPageMetadata } from "@/lib/page-metadata";
import { DEFAULT_OG_IMAGE_PATH } from "@/lib/site";
import type { ClubReport } from "@dongle/types/club/club.report";

export function buildReportDescription(report: ClubReport, clubName: string) {
    const plainText = report.content
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    if (!plainText) {
        return `${clubName}의 활동보고서입니다. 동아리 활동 사진과 기록을 확인해 보세요.`;
    }

    return plainText.length > 140 ? `${plainText.slice(0, 137)}...` : plainText;
}

export function buildReportPageMetadata(report: ClubReport, clubName: string, clubId: number) {
    const description = buildReportDescription(report, clubName);
    const canonicalPath = `/clubs/${clubId}/reports/${report.id}`;
    const image = report.image_urls.find((url) => url.trim().length > 0) ?? DEFAULT_OG_IMAGE_PATH;

    return buildPageMetadata({
        title: report.title,
        description,
        canonicalPath,
        openGraphTitle: `${report.title} | ${clubName}`,
        openGraphType: "article",
        image,
        imageAlt: `${report.title} 대표 사진`,
    });
}

export function buildReportFallbackMetadata(clubId: string, reportId: string, reason: "invalid" | "not_found") {
    const canonicalPath = `/clubs/${clubId}/reports/${reportId}`;

    if (reason === "invalid") {
        return buildPageMetadata({
            title: "활동보고서를 찾을 수 없음",
            description: "올바르지 않은 활동보고서 주소입니다. 동아리 상세 페이지에서 다시 확인해 보세요.",
            canonicalPath,
            openGraphType: "article",
        });
    }

    return buildPageMetadata({
        title: "활동보고서를 찾을 수 없음",
        description: "요청하신 활동보고서를 찾을 수 없습니다. 동아리 상세 페이지에서 다른 보고서를 확인해 보세요.",
        canonicalPath,
        openGraphType: "article",
    });
}

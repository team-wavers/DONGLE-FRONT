import { getClubReportListService, getClubReportService, getClubService } from "@/lib/server/cached-services";
import {
    buildReportFallbackMetadata,
    buildReportPageMetadata,
} from "@/lib/report-page-metadata";
import { isClubReportNotFoundResponse } from "@dongle/service/club/club.report.service";
import { formatDateByLocale } from "@dongle/ui/utils";
import { ArrowLeft, CalendarDays, PencilLine } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ClubSummaryCard from "./_components/club-summary-card";
import OtherReportList from "./_components/other-report-list";
import ReportImageGallery from "./_components/report-image-gallery";
import ClientRichTextViewer from "@/components/rich-text/client-rich-text-viewer";

interface ClubReportDetailPageProps {
    params: Promise<{ clubId: string; reportId: string }>;
}

function parseRouteParams(clubId: string, reportId: string) {
    const clubIdNumber = Number(clubId);
    const reportIdNumber = Number(reportId);

    if (Number.isNaN(clubIdNumber) || Number.isNaN(reportIdNumber)) {
        return null;
    }

    return { clubIdNumber, reportIdNumber };
}

export async function generateMetadata({ params }: ClubReportDetailPageProps): Promise<Metadata> {
    const { clubId, reportId } = await params;
    const parsedParams = parseRouteParams(clubId, reportId);

    if (!parsedParams) {
        return buildReportFallbackMetadata(clubId, reportId, "invalid");
    }

    const [clubResponse, reportsResponse] = await Promise.all([
        getClubService(parsedParams.clubIdNumber),
        getClubReportService(parsedParams.clubIdNumber, parsedParams.reportIdNumber),
    ]);

    const report = reportsResponse.isSuccess ? reportsResponse.result : null;
    const club = clubResponse.isSuccess ? clubResponse.result : null;

    if (!report || !club) {
        return buildReportFallbackMetadata(clubId, reportId, "not_found");
    }

    return buildReportPageMetadata(report, club.name, club.id);
}

export default async function ClubReportDetailPage({ params }: ClubReportDetailPageProps) {
    const { clubId, reportId } = await params;
    const parsedParams = parseRouteParams(clubId, reportId);

    if (!parsedParams) {
        notFound();
    }

    const { clubIdNumber, reportIdNumber } = parsedParams;
    const [clubResponse, reportsResponse, reportResponse] = await Promise.all([
        getClubService(clubIdNumber),
        getClubReportListService(clubIdNumber),
        getClubReportService(clubIdNumber, reportIdNumber),
    ]);

    if (!clubResponse.isSuccess || !clubResponse.result) {
        notFound();
    }

    if (!reportsResponse.isSuccess) {
        throw new Error("활동보고서 목록을 불러오지 못했습니다.");
    }

    if (!reportResponse.isSuccess) {
        if (isClubReportNotFoundResponse(reportResponse)) {
            notFound();
        }

        throw new Error("활동보고서를 불러오지 못했습니다.");
    }

    const club = clubResponse.result;
    const report = reportResponse.result;

    if (!report) {
        notFound();
    }

    const otherReports = reportsResponse.result
        .filter((item) => item.id !== report.id)
        .map((item) => ({
            id: item.id,
            title: item.title,
            createdAt: item.createdAt,
            image_urls: item.image_urls,
        }));
    const wasUpdated = report.updatedAt !== report.createdAt;
    const hasReportImages = report.image_urls.some((url) => url.trim().length > 0);

    return (
        <article className="py-6 md:py-10">
            <div className="mb-5">
                <Link
                    href={`/clubs/${club.id}`}
                    className="inline-flex h-10 items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-sm font-bold text-zinc-700 transition-colors hover:bg-zinc-50">
                    <ArrowLeft className="size-4" aria-hidden="true" />
                    {club.name}으로 돌아가기
                </Link>
            </div>

            <header className="grid gap-6 border-b border-zinc-200 py-4 lg:grid-cols-[minmax(0,1fr)_280px]">
                <div className="min-w-0">
                    <div className="flex flex-col gap-4">
                        <h1 className="break-words text-4xl font-black leading-tight tracking-normal text-zinc-950 md:text-5xl">
                            {report.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-bold text-zinc-500">
                            <span className="inline-flex items-center gap-1.5">
                                <CalendarDays className="size-4" aria-hidden="true" />
                                작성일 {formatDateByLocale(report.createdAt)}
                            </span>
                            {wasUpdated ? (
                                <span className="inline-flex items-center gap-1.5">
                                    <PencilLine className="size-4" aria-hidden="true" />
                                    수정일 {formatDateByLocale(report.updatedAt)}
                                </span>
                            ) : null}
                        </div>
                    </div>
                </div>

                <ClubSummaryCard club={club} />
            </header>

            <div className="grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-start">
                <main className="min-w-0 space-y-8">
                    <ReportImageGallery report={report} />

                    <section className={hasReportImages ? "border-t border-zinc-200 pt-8" : undefined}>
                        <ClientRichTextViewer html={report.content} className="max-w-[720px] text-[17px]" />
                    </section>
                </main>

                <aside className="space-y-4 lg:sticky lg:top-20">
                    <OtherReportList clubId={club.id} reports={otherReports} />
                </aside>
            </div>
        </article>
    );
}

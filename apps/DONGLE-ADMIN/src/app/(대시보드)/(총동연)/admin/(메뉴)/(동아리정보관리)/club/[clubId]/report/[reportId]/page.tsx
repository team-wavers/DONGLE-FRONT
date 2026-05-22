import { Suspense } from "react";
import { getClubReportService } from "@/lib/server/cached-services";
import ReportView from "@/feature/report/components/report-view/report-view";
import { Skeleton } from "@dongle/ui/skeleton";

async function AdminClubReportDetailContent({ clubId, reportId }: { clubId: string; reportId: string }) {
    const { result, isSuccess } = await getClubReportService(Number(clubId), Number(reportId));

    if (!isSuccess) {
        throw new Error("활동보고서를 가져오는데 실패했습니다.");
    }

    if (!result) {
        return <div className="flex flex-col gap-4 w-full pt-16">활동 보고서가 없습니다.</div>;
    }

    return (
        <div className="w-full max-w-full">
            <ReportView
                report={{
                    title: result.title,
                    content: result.content,
                    createdAt: result.createdAt,
                    image_urls: result.image_urls,
                }}
                backHref={`/admin/club/${clubId}/report`}
                backButtonText="활동보고서 목록"
            />
        </div>
    );
}

function AdminClubReportDetailFallback() {
    return (
        <div className="w-full max-w-full space-y-6">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-72 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
    );
}

export default async function AdminClubReportDetailPage({
    params,
}: {
    params: Promise<{ reportId: string; clubId: string }>;
}) {
    const { reportId, clubId } = await params;

    return (
        <Suspense fallback={<AdminClubReportDetailFallback />}>
            <AdminClubReportDetailContent clubId={clubId} reportId={reportId} />
        </Suspense>
    );
}

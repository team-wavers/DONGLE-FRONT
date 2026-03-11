import { Suspense } from "react";
import { getClubReportFromListService } from "@/lib/server/cached-services";
import ReportView from "@/components/molecules/layout/report-view/report-view";
import { Skeleton } from "@dongle/ui/skeleton";

async function AdminReportDetailContent({ clubId, reportId }: { clubId: string; reportId: string }) {
    // 캐시된 목록에서 특정 보고서 찾기
    const { result, isSuccess } = await getClubReportFromListService(Number(clubId), Number(reportId));

    if (!isSuccess) {
        throw new Error("활동보고서를 가져오는데 실패했습니다.");
    }

    if (!result) {
        return <div className="flex flex-col gap-4 w-full pt-16">활동 보고서가 없습니다.</div>;
    }

    return (
        <div className="flex flex-col gap-4 w-full">
            <div className="max-w-2xl mx-auto w-full">
                <ReportView
                    report={{
                        title: result.title,
                        content: result.content,
                        createdAt: result.createdAt,
                        image_urls: result.image_urls,
                    }}
                    backHref={`/admin/report/${clubId}`}
                    backButtonText="돌아가기"
                />
            </div>
        </div>
    );
}

function AdminReportDetailFallback() {
    return (
        <div className="flex flex-col gap-4 w-full">
            <div className="max-w-2xl mx-auto w-full space-y-6">
                <Skeleton className="h-10 w-28" />
                <Skeleton className="h-72 w-full rounded-2xl" />
                <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
        </div>
    );
}

export default async function AdminReportDetailPage({
    params,
}: {
    params: Promise<{ reportId: string; clubId: string }>;
}) {
    const { reportId, clubId } = await params;

    return (
        <Suspense fallback={<AdminReportDetailFallback />}>
            <AdminReportDetailContent clubId={clubId} reportId={reportId} />
        </Suspense>
    );
}

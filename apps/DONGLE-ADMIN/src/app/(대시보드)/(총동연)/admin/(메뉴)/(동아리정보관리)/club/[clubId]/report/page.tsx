import { Suspense } from "react";
import ReportCard from "@/feature/report/components/report-card/report-card";
import { getClubReportListService } from "@/lib/server/cached-services";
import { ClubReport } from "@dongle/types/club/club.report.d";
import { Skeleton } from "@dongle/ui/skeleton";

async function AdminClubReportList({ clubId }: { clubId: string }) {
    const { result, isSuccess } = await getClubReportListService(Number(clubId));

    if (!isSuccess || !result) {
        throw new Error("활동 보고서를 가져오는데 실패했습니다.");
    }

    if (result.length === 0) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="text-zinc-500">등록된 활동 보고서가 없습니다.</div>
            </div>
        );
    }

    return (
        <div className="flex w-full max-w-full flex-col items-start gap-4">
            {result.map((report: ClubReport) => (
                <ReportCard
                    key={report.id}
                    href={`/admin/club/${clubId}/report/${report.id}`}
                    title={report.title}
                    createdDate={report.createdAt}
                />
            ))}
        </div>
    );
}

function AdminClubReportListFallback() {
    return (
        <div className="flex w-full max-w-full flex-col gap-4">
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
        </div>
    );
}

export default async function AdminClubReportPage({ params }: { params: Promise<{ clubId: string }> }) {
    const { clubId } = await params;

    return (
        <Suspense fallback={<AdminClubReportListFallback />}>
            <AdminClubReportList clubId={clubId} />
        </Suspense>
    );
}

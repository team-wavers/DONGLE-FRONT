import { Suspense } from "react";
import ReportCard from "@/feature/report/components/report-card/report-card";
import { getClubReportListService } from "@/lib/server/cached-services";
import { ClubReport } from "@dongle/types/club/club.report.d";
import { Skeleton } from "@dongle/ui/skeleton";
import { AdminFormShell } from "@/shared/layout/form-page/admin-form-layout";

async function AdminClubReportList({ clubId }: { clubId: string }) {
    const { result, isSuccess } = await getClubReportListService(Number(clubId));

    if (!isSuccess || !result) {
        throw new Error("활동 보고서를 가져오는데 실패했습니다.");
    }

    if (result.length === 0) {
        return (
            <div className="flex min-h-40 items-center justify-center rounded-lg border bg-white py-8">
                <div className="text-zinc-500">등록된 활동 보고서가 없습니다.</div>
            </div>
        );
    }

    return (
        <div className="flex w-full flex-col items-start gap-3">
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
        <div className="flex w-full flex-col gap-3">
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
        </div>
    );
}

export default async function AdminClubReportPage({ params }: { params: Promise<{ clubId: string }> }) {
    const { clubId } = await params;

    return (
        <AdminFormShell>
            <Suspense fallback={<AdminClubReportListFallback />}>
                <AdminClubReportList clubId={clubId} />
            </Suspense>
        </AdminFormShell>
    );
}

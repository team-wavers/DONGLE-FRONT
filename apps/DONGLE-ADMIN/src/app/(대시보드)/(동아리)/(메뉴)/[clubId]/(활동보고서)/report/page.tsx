import { Suspense } from "react";
import ReportCard from "@/feature/report/components/report-card/report-card";
import Link from "next/link";
import { Button } from "@dongle/ui/button";
import { Pencil } from "lucide-react";
import { ClubReport } from "@dongle/types/club/club.report.d";
import { Skeleton } from "@dongle/ui/skeleton";
import { AdminFormShell } from "@/shared/layout/form-page/admin-form-layout";
import { loadClubReportListViewModel } from "./club-report-list-view-model";

async function ClubReportListContent({ clubId }: { clubId: string }) {
    const { reports, loadFailed } = await loadClubReportListViewModel(clubId);

    if (loadFailed) {
        return (
            <div className="flex min-h-40 items-center justify-center rounded-lg border bg-white py-16">
                <div className="text-red-500">활동보고서를 불러오지 못했습니다. 잠시 후 다시 확인해주세요.</div>
            </div>
        );
    }

    return (
        <>
            {reports.length > 0 ? (
                <div className="flex w-full flex-col gap-3">
                    {reports.map((report: ClubReport) => (
                        <ReportCard
                            key={report.id}
                            title={report.title}
                            createdDate={report.createdAt}
                            content={report.content}
                            href={`/${clubId}/report/${report.id}`}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex min-h-40 items-center justify-center rounded-lg border bg-white py-16">
                    <div className="text-gray-500">활동보고서가 없습니다.</div>
                </div>
            )}
        </>
    );
}

function ClubReportListFallback() {
    return (
        <div className="flex w-full flex-col gap-3">
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
        </div>
    );
}

export default async function Page({ params }: { params: Promise<{ clubId: string }> }) {
    const { clubId } = await params;

    return (
        <AdminFormShell>
            <div className="flex justify-end">
                <Button asChild className="font-semibold">
                    <Link href="./create">
                        <Pencil className="h-4 w-4" />
                        작성하기
                    </Link>
                </Button>
            </div>
            <Suspense fallback={<ClubReportListFallback />}>
                <ClubReportListContent clubId={clubId} />
            </Suspense>
        </AdminFormShell>
    );
}

import { Suspense } from "react";
import ReportCard from "@/feature/report/components/report-card/report-card";
import { getClubReportListService } from "@/lib/server/cached-services";
import Link from "next/link";
import { Button } from "@dongle/ui/button";
import { Pencil } from "lucide-react";
import { ClubReport } from "@dongle/types/club/club.report.d";
import { Skeleton } from "@dongle/ui/skeleton";
import { AdminFormShell } from "@/shared/components/molecules/layout/admin-form-layout/admin-form-layout";

async function ClubReportListContent({ clubId }: { clubId: string }) {
    // 서버에서 데이터 가져오기
    const { result } = await getClubReportListService(Number(clubId));

    return (
        <>
            {result && result.length > 0 ? (
                <div className="flex w-full flex-col gap-3">
                    {result.map((report: ClubReport) => (
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

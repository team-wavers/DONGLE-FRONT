import { Suspense } from "react";
import { getClubReportService } from "@/lib/server/cached-services";
import ReportView from "@/feature/report/components/report-view/report-view";
import Link from "next/link";
import { Button } from "@dongle/ui/button";
import { Pencil } from "lucide-react";
import DeleteReportButton from "@/feature/report/components/delete-report-button";
import { Skeleton } from "@dongle/ui/skeleton";

async function ClubReportDetailContent({ clubId, reportId }: { clubId: string; reportId: string }) {
    const { result } = await getClubReportService(Number(clubId), Number(reportId));

    if (!result) {
        return <div className="flex justify-center items-center py-16 text-zinc-500">활동 보고서가 없습니다.</div>;
    }

    return (
        <div className="flex flex-col gap-4 w-full">
            <ReportView
                report={{
                    title: result.title,
                    content: result.content,
                    createdAt: result.createdAt,
                    image_urls: result.image_urls,
                }}
                backHref={`/${clubId}/report`}
                backButtonText="목록으로 돌아가기"
            />
            <div className="mt-4 flex justify-end gap-3 border-t border-gray-200 pt-4">
                <DeleteReportButton clubId={clubId} reportId={reportId} />
                <Link href={`/${clubId}/report/${reportId}/edit`}>
                    <Button className="bg-primary hover:bg-primary/90 text-white">
                        <Pencil className="w-4 h-4 mr-2" />
                        수정하기
                    </Button>
                </Link>
            </div>
        </div>
    );
}

function ClubReportDetailFallback() {
    return (
        <div className="flex flex-col gap-4 w-full">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-72 w-full rounded-2xl" />
            <div className="mt-4 flex justify-end gap-3 border-t border-gray-200 pt-4">
                <Skeleton className="h-10 w-28" />
                <Skeleton className="h-10 w-28" />
            </div>
        </div>
    );
}

export default async function Page({ params }: { params: Promise<{ clubId: string; reportId: string }> }) {
    const { clubId, reportId } = await params;

    return (
        <Suspense fallback={<ClubReportDetailFallback />}>
            <ClubReportDetailContent clubId={clubId} reportId={reportId} />
        </Suspense>
    );
}

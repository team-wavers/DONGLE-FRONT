import { Suspense } from "react";
import { getClubReportFromListService } from "@/lib/server/cached-services";
import ActivityReportForm from "@/feature/report/components/activity-report-form/activity-report-form";
import { updateActivityReportAction } from "@/feature/report/action/update-activity-report-form.action";
import GoBackButton from "@/components/atoms/button/go-back-button/go-back-button";
import { Skeleton } from "@dongle/ui/skeleton";

async function EditReportContent({ clubId, reportId }: { clubId: string; reportId: string }) {
    // 캐시된 목록에서 특정 보고서 찾기
    const { result, isSuccess } = await getClubReportFromListService(Number(clubId), Number(reportId));

    if (!isSuccess) {
        throw new Error("활동보고서를 가져오는데 실패했습니다.");
    }

    if (!result) {
        return <div className="flex justify-center items-center py-16 text-zinc-500">활동 보고서가 없습니다.</div>;
    }

    return (
        <div className="flex flex-col gap-4 w-full">
            <div className="mb-4">
                <GoBackButton fallbackHref={`/${clubId}/report/${reportId}`} />
            </div>

            <div className="max-w-4xl w-full">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold mb-2">활동보고서 수정</h1>
                </div>

                <ActivityReportForm
                    customAction={updateActivityReportAction}
                    title={result.title}
                    content={result.content}
                    clubId={clubId}
                    images={result.image_urls}
                    reportId={reportId}
                    successRedirectHref={`/${clubId}/report/${reportId}`}
                    successMessage="활동 보고서가 성공적으로 수정되었습니다!"
                />
            </div>
        </div>
    );
}

function EditReportFallback() {
    return (
        <div className="flex flex-col gap-4 w-full">
            <Skeleton className="h-10 w-24" />
            <div className="max-w-4xl w-full space-y-6">
                <Skeleton className="h-10 w-40" />
                <Skeleton className="h-[34rem] w-full rounded-2xl" />
            </div>
        </div>
    );
}

export default async function EditReportPage({ params }: { params: Promise<{ clubId: string; reportId: string }> }) {
    const { clubId, reportId } = await params;

    return (
        <Suspense fallback={<EditReportFallback />}>
            <EditReportContent clubId={clubId} reportId={reportId} />
        </Suspense>
    );
}

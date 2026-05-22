import { Suspense } from "react";
import { getClubReportService } from "@/lib/server/cached-services";
import ActivityReportForm from "@/feature/report/components/activity-report-form/activity-report-form";
import { Skeleton } from "@dongle/ui/skeleton";
import { AdminFormShell } from "@/shared/layout/form-page/admin-form-layout";

async function EditReportContent({ clubId, reportId }: { clubId: string; reportId: string }) {
    const { result, isSuccess } = await getClubReportService(Number(clubId), Number(reportId));

    if (!isSuccess) {
        throw new Error("활동보고서를 가져오는데 실패했습니다.");
    }

    if (!result) {
        return <div className="flex justify-center items-center py-16 text-zinc-500">활동 보고서가 없습니다.</div>;
    }

    return (
        <ActivityReportForm
            title={result.title}
            content={result.content}
            clubId={clubId}
            images={result.image_urls}
            reportId={reportId}
            successRedirectHref={`/${clubId}/report/${reportId}`}
            successMessage="활동 보고서가 성공적으로 수정되었습니다!"
            backHref={`/${clubId}/report/${reportId}`}
            headingTitle="활동보고서 수정"
            headingDescription="등록된 활동보고서 내용을 수정합니다."
        />
    );
}

function EditReportFallback() {
    return (
        <AdminFormShell>
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-[34rem] w-full rounded-2xl" />
        </AdminFormShell>
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

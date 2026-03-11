import { Suspense } from "react";
import ReportCardContainer from "@/components/organics/report-card.container";
import { getClubListService } from "@/lib/server/cached-services";
import { Skeleton } from "@dongle/ui/skeleton";
import { Club } from "@dongle/types/club/club.d";
import AdminPageHeader from "@/components/molecules/layout/admin-page-header/admin-page-header";

async function AdminReportList() {
    // 서버에서 동아리 목록 가져오기
    const { result, isSuccess } = await getClubListService();

    if (!isSuccess || !result) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="text-zinc-500">동아리 목록을 가져오는데 실패했습니다.</div>
            </div>
        );
    }

    if (result.length === 0) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="text-zinc-500">등록된 동아리가 없습니다.</div>
            </div>
        );
    }

    return (
        <div className="grid gap-4">
            {result.map((club: Club) => (
                <ReportCardContainer key={club.id} club={club} />
            ))}
        </div>
    );
}

function AdminReportListFallback() {
    return (
        <div className="grid gap-4">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
        </div>
    );
}

export default function AdminReportPage() {
    return (
        <div className="flex flex-col h-full w-full">
            <AdminPageHeader
                title="활동보고서 관리"
                description="동아리를 선택하여 해당 동아리의 활동보고서를 조회할 수 있습니다."
            />
            <Suspense fallback={<AdminReportListFallback />}>
                <AdminReportList />
            </Suspense>
        </div>
    );
}

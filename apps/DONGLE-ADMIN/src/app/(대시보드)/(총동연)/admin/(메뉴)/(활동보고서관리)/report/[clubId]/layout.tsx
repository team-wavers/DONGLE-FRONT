import { Suspense } from "react";
import AdminPageHeader from "@/components/molecules/layout/admin-page-header/admin-page-header";
import { getClubService } from "@/lib/server/cached-services";
import { Skeleton } from "@dongle/ui/skeleton";

async function ClubReportHeader({ clubId }: { clubId: string }) {
    const { result: clubResult, isSuccess } = await getClubService(Number(clubId));
    const currentClubName = isSuccess && clubResult ? clubResult.name : `동아리 #${clubId}`;
    const currentClubCategory = isSuccess && clubResult ? clubResult.category : "확인 불가";

    return (
        <AdminPageHeader
            title={`${currentClubName} 동아리의 활동보고서`}
            description={`${currentClubCategory} 소속`}
        />
    );
}

function ClubReportHeaderFallback() {
    return (
        <div className="flex flex-col gap-4 w-full mb-6">
            <Skeleton className="h-8 w-72" />
            <Skeleton className="h-4 w-24" />
        </div>
    );
}

export default async function ClubReportLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ clubId: string }>;
}) {
    const { clubId } = await params;

    return (
        <div className="flex flex-col w-full h-full">
            <Suspense fallback={<ClubReportHeaderFallback />}>
                <ClubReportHeader clubId={clubId} />
            </Suspense>
            {children}
        </div>
    );
}

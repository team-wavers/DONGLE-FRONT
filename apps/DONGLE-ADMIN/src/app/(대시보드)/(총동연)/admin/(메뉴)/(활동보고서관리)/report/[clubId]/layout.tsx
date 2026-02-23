import AdminPageHeader from "@/components/molecules/layout/admin-page-header/admin-page-header";
import { getClubService } from "@dongle/service/club/club.service";

export default async function ClubReportLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ clubId: string }>;
}) {
    const { clubId } = await params;
    const { result: clubResult, isSuccess } = await getClubService(Number(clubId));
    const currentClubName = isSuccess && clubResult ? clubResult.name : `동아리 #${clubId}`;
    const currentClubCategory = isSuccess && clubResult ? clubResult.category : "확인 불가";

    return (
        <div className="flex flex-col w-full h-full">
            <AdminPageHeader
                title={`${currentClubName} 동아리의 활동보고서`}
                description={`${currentClubCategory} 소속`}
            />
            {children}
        </div>
    );
}

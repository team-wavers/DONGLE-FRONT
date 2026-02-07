import ClubEditCardContainer from "@/components/organics/club-edit-card.container";
import { getClubListService } from "@dongle/service/club/club.service";
import { Users } from "lucide-react";
import { Club } from "@dongle/types/club/club.d";
import AdminPageHeader from "@/components/molecules/layout/admin-page-header/admin-page-header";

export default async function ClubPage() {
    const { result, isSuccess } = await getClubListService();

    if (!isSuccess || !result) {
        return (
            <>
                <AdminPageHeader title="동아리 정보 관리" description="동아리 정보를 관리할 수 있습니다." />
                <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>동아리 목록을 불러오는 중 오류가 발생했습니다.</p>
                </div>
            </>
        );
    }

    if (result.length === 0) {
        return (
            <>
                <AdminPageHeader title="동아리 정보 관리" description="동아리 정보를 관리할 수 있습니다." />
                <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>등록된 동아리가 없습니다</p>
                </div>
            </>
        );
    }

    return (
        <div className="flex flex-col w-full h-full gap-4">
            <AdminPageHeader title="동아리 정보 관리" description="동아리 정보를 관리할 수 있습니다." />
            <div className="grid gap-4">
                {result.map((club: Club) => (
                    <ClubEditCardContainer key={club.id} club={club} />
                ))}
            </div>
        </div>
    );
}

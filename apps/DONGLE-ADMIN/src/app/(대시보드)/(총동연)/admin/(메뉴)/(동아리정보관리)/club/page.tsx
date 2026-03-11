import { Suspense } from "react";
import ClubEditCardContainer from "@/components/organics/club-edit-card.container";
import { getClubListService } from "@/lib/server/cached-services";
import { Users } from "lucide-react";
import { Club } from "@dongle/types/club/club.d";
import AdminPageHeader from "@/components/molecules/layout/admin-page-header/admin-page-header";
import { Skeleton } from "@dongle/ui/skeleton";

async function ClubListSection() {
    const { result, isSuccess } = await getClubListService();

    if (!isSuccess || !result) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>동아리 목록을 불러오는 중 오류가 발생했습니다.</p>
            </div>
        );
    }

    if (result.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>등록된 동아리가 없습니다</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4">
            {result.map((club: Club) => (
                <ClubEditCardContainer key={club.id} club={club} />
            ))}
        </div>
    );
}

function ClubListFallback() {
    return (
        <div className="grid gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
        </div>
    );
}

export default function ClubPage() {
    return (
        <div className="flex flex-col w-full h-full gap-4">
            <AdminPageHeader title="동아리 정보 관리" description="동아리 정보를 관리할 수 있습니다." />
            <Suspense fallback={<ClubListFallback />}>
                <ClubListSection />
            </Suspense>
        </div>
    );
}

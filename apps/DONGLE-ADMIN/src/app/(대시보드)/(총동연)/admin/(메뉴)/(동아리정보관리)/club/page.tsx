import { Suspense } from "react";
import FilterableClubList from "@/feature/club/components/filterable-club-list/filterable-club-list";
import { getClubListService } from "@/lib/server/cached-services";
import { Users } from "lucide-react";
import AdminPageHeader from "@/shared/components/molecules/layout/admin-page-header/admin-page-header";
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
        <FilterableClubList
            clubs={result}
            searchPlaceholder="동아리명, 분과 검색"
            emptyMessage="등록된 동아리가 없습니다."
            emptySearchMessage="검색 조건에 맞는 동아리가 없습니다."
        />
    );
}

function ClubListFallback() {
    return (
        <div className="grid gap-4">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-52 w-full" />
        </div>
    );
}

export default function ClubPage() {
    return (
        <div className="flex flex-col w-full h-full gap-4">
            <AdminPageHeader title="동아리 관리" description="동아리 정보와 활동보고서를 관리할 수 있습니다." />
            <Suspense fallback={<ClubListFallback />}>
                <ClubListSection />
            </Suspense>
        </div>
    );
}

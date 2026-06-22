import { Suspense } from "react";
import FilterableClubList from "@/feature/club/components/filterable-club-list/filterable-club-list";
import { getClubListService } from "@/lib/server/cached-services";
import AdminPageHeader from "@/shared/layout/page-header/admin-page-header";

async function loadClubListViewModel() {
    try {
        const { result, isSuccess } = await getClubListService();

        return { clubs: isSuccess && result ? result : [], loadFailed: !isSuccess || !result };
    } catch {
        return { clubs: [], loadFailed: true };
    }
}

async function ClubListSection() {
    const { clubs, loadFailed } = await loadClubListViewModel();

    return (
        <Suspense fallback={null}>
            <FilterableClubList
                clubs={clubs}
                loadFailed={loadFailed}
                searchPlaceholder="동아리명, 분과 검색"
                emptyMessage="등록된 동아리가 없습니다."
                emptySearchMessage="검색 조건에 맞는 동아리가 없습니다."
            />
        </Suspense>
    );
}

export default function ClubPage() {
    return (
        <div className="flex flex-col w-full h-full gap-4">
            <AdminPageHeader title="동아리 관리" description="동아리 정보와 활동보고서를 관리할 수 있습니다." />
            <ClubListSection />
        </div>
    );
}

import { Suspense } from "react";
import { getUserListService } from "@/lib/server/cached-services";
import { Skeleton } from "@dongle/ui/skeleton";
import FilterableUserList from "@/feature/user/components/filterable-user-list";
import AdminPageHeader from "@/components/molecules/layout/admin-page-header/admin-page-header";

async function UserListSection() {
    const userListResponse = await getUserListService();
    const users = userListResponse.result || [];

    return <FilterableUserList users={users} />;
}

function UserListFallback() {
    return (
        <>
            <div className="flex items-center justify-between gap-4 mb-4">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-10 w-24" />
            </div>
            <div className="mb-6">
                <Skeleton className="h-11 w-full" />
                <Skeleton className="mt-2 h-5 w-44" />
            </div>
            <div className="grid gap-4">
                <Skeleton className="h-36 w-full" />
                <Skeleton className="h-36 w-full" />
                <Skeleton className="h-36 w-full" />
            </div>
        </>
    );
}

export default function UserManagementPage() {
    return (
        <div className="flex flex-col w-full h-full">
            <AdminPageHeader title="사용자 관리" description="사용자 정보를 관리할 수 있습니다." />
            <Suspense fallback={<UserListFallback />}>
                <UserListSection />
            </Suspense>
        </div>
    );
}

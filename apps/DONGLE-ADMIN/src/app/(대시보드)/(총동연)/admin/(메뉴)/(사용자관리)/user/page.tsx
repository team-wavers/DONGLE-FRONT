import { Suspense } from "react";
import { getAccessTokenFromServerCookie } from "@dongle/api/utils/cookie/server-cookie.util";
import { getUserIdFromToken } from "@dongle/api/utils/jwt.util";
import { getUserListService } from "@/lib/server/cached-services";
import { Skeleton } from "@dongle/ui/skeleton";
import FilterableUserList from "@/feature/user/components/filterable-user-list";
import AdminPageHeader from "@/shared/layout/page-header/admin-page-header";

async function UserListSection() {
    const [userListResponse, accessToken] = await Promise.all([getUserListService(), getAccessTokenFromServerCookie()]);
    const users = userListResponse.isSuccess ? userListResponse.result || [] : [];
    const tokenUserId = accessToken ? Number(getUserIdFromToken(accessToken)) : null;
    const currentUserId = Number.isFinite(tokenUserId) ? tokenUserId : null;

    return <FilterableUserList users={users} currentUserId={currentUserId} loadFailed={!userListResponse.isSuccess} />;
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
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-64 w-full" />
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

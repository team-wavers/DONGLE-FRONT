import { Suspense } from "react";
import { getUserListService } from "@/lib/server/cached-services";
import { User } from "@dongle/types/user/user.d";
import { Card, CardContent } from "@dongle/ui/card";
import { Skeleton } from "@dongle/ui/skeleton";
import { User as UserIcon } from "lucide-react";
import UserCard from "@/feature/user/components/user-card";
import UserCreateButton from "@/feature/user/components/user-create-button";
import AdminPageHeader from "@/components/molecules/layout/admin-page-header/admin-page-header";

async function UserListSection() {
    const userListResponse = await getUserListService();
    const users = userListResponse.result || [];

    return (
        <>
            <div className="flex items-center justify-between gap-4 mb-4">
                <div className="text-sm text-gray-600">
                    총 <span className="font-semibold text-blue-600">{users.length}</span>
                    명의 사용자
                </div>
                <UserCreateButton />
            </div>

            <div className="grid gap-4">
                {users.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <UserIcon className="w-12 h-12 text-gray-400 mb-4" />
                            <p className="text-gray-500 text-lg">등록된 사용자가 없습니다.</p>
                        </CardContent>
                    </Card>
                ) : (
                    users.map((user: User) => <UserCard key={user.id} user={user} />)
                )}
            </div>
        </>
    );
}

function UserListFallback() {
    return (
        <>
            <div className="flex items-center justify-between gap-4 mb-4">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-10 w-24" />
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

import { getUserListService } from "@dongle/service/user/user.service";
import { User } from "@dongle/types/user/user.d";
import { Card, CardContent } from "@dongle/ui/card";
import { User as UserIcon } from "lucide-react";
import UserCard from "@/feature/user/components/user-card";
import AdminPageHeader from "@/components/molecules/layout/admin-page-header/admin-page-header";

export default async function UserManagementPage() {
    const userListResponse = await getUserListService({
        excludeLoginIds: ["admin"],
    });
    const users = userListResponse.result || [];

    return (
        <div className="flex flex-col w-full h-full">
            <AdminPageHeader title="사용자 관리" description="사용자 정보를 관리할 수 있습니다." />
            <div className="flex items-center gap-4 mb-4">
                <div className="text-sm text-gray-600">
                    총 <span className="font-semibold text-blue-600">{users.length}</span>
                    명의 사용자
                </div>
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
        </div>
    );
}

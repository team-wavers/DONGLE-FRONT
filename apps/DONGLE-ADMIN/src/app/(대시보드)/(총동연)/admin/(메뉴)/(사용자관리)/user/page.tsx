import { Suspense } from "react";
import FilterableUserList from "@/feature/user/components/filterable-user-list";
import AdminPageHeader from "@/shared/layout/page-header/admin-page-header";
import { loadUserListViewModel } from "./user-list-view-model";

async function UserListSection() {
    const { users, currentUserId, loadFailed } = await loadUserListViewModel();

    return (
        <Suspense fallback={null}>
            <FilterableUserList users={users} currentUserId={currentUserId} loadFailed={loadFailed} />
        </Suspense>
    );
}

export default function UserManagementPage() {
    return (
        <div className="flex flex-col w-full h-full">
            <AdminPageHeader title="사용자 관리" description="사용자 정보를 관리할 수 있습니다." />
            <UserListSection />
        </div>
    );
}

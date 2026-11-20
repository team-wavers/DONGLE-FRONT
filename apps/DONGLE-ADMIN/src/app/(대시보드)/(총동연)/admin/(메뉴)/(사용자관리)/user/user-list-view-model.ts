import type { User } from "@dongle/types/user/user";
import { getUserListService } from "@/lib/server/cached-services";
import { requireAdminPageAccess } from "@/shared/action/server-page-auth";

function projectUser(user: User): User {
    return {
        id: user.id,
        name: user.name,
        login_id: user.login_id,
        role: user.role,
        phone: user.phone,
        created_at: user.created_at,
        updated_at: user.updated_at,
        deleted_at: user.deleted_at,
        ...(user.club ? { club: { id: user.club.id, name: user.club.name } } : {}),
    };
}

export async function loadUserListViewModel() {
    const { claims } = await requireAdminPageAccess();
    const [userListResponse] = await Promise.allSettled([getUserListService()]);
    const userListResult = userListResponse.status === "fulfilled" ? userListResponse.value : null;
    const users = userListResult?.isSuccess ? (userListResult.result || []).map(projectUser) : [];
    const tokenUserId = claims.user_id ?? claims.sub;
    const currentUserId =
        typeof tokenUserId === "number" ? tokenUserId : typeof tokenUserId === "string" ? Number.parseInt(tokenUserId, 10) : null;

    return { users, currentUserId, loadFailed: !userListResult?.isSuccess };
}

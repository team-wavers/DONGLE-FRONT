import { getAccessTokenFromServerCookie } from "@dongle/api/utils/cookie/server-cookie.util";
import { getUserIdFromToken } from "@dongle/api/utils/jwt.util";
import { getUserListService } from "@/lib/server/cached-services";

export async function loadUserListViewModel() {
    const [userListResponse, accessTokenResult] = await Promise.allSettled([
        getUserListService(),
        getAccessTokenFromServerCookie(),
    ]);
    const userListResult = userListResponse.status === "fulfilled" ? userListResponse.value : null;
    const accessToken = accessTokenResult.status === "fulfilled" ? accessTokenResult.value : null;
    const users = userListResult?.isSuccess ? userListResult.result || [] : [];
    const tokenUserId = accessToken ? getUserIdFromToken(accessToken) : null;
    const currentUserId = tokenUserId === null ? null : Number(tokenUserId);

    return { users, currentUserId, loadFailed: !userListResult?.isSuccess };
}

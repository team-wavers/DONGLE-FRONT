import { getAccessTokenFromServerCookie } from "@dongle/api/utils/cookie/server-cookie.util";

export async function requireServerActionAccessToken() {
    const accessToken = await getAccessTokenFromServerCookie();

    if (!accessToken) {
        throw new Error("Unauthorized");
    }

    return accessToken;
}

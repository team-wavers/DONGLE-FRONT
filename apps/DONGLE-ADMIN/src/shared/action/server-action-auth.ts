import { getAccessTokenFromServerCookie } from "@dongle/api/utils/cookie/server-cookie.util";
import { verifyJwtToken, type JwtPayload } from "@dongle/api/utils/jwt.util";
import { AUTH_ROLE, type AuthRole } from "@dongle/types/auth/auth-role";

type ServerActionAccessOptions = {
    role?: AuthRole;
    clubId?: string | number;
};

export type VerifiedServerActionAccess = {
    accessToken: string;
    claims: JwtPayload;
};

export async function requireServerActionAccessToken(
    options: ServerActionAccessOptions = {}
): Promise<VerifiedServerActionAccess> {
    const accessToken = await getAccessTokenFromServerCookie();

    if (!accessToken) {
        throw new Error("Unauthorized");
    }

    const claims = await verifyJwtToken(accessToken);
    if (!claims) {
        throw new Error("Unauthorized");
    }

    if (options.role && claims.role !== options.role) {
        throw new Error("Forbidden");
    }

    if (options.clubId !== undefined && claims.role !== AUTH_ROLE.ADMIN) {
        const claimClubId =
            typeof claims.club_id === "string" || typeof claims.club_id === "number"
                ? String(claims.club_id)
                : null;
        if (!claimClubId || claimClubId !== String(options.clubId)) {
            throw new Error("Forbidden");
        }
    }

    return { accessToken, claims };
}

import { notFound, redirect } from "next/navigation";
import { getAccessTokenFromServerCookie } from "@dongle/api/utils/cookie/server-cookie.util";
import { verifyJwtToken, type JwtPayload } from "@dongle/api/utils/jwt.util";
import { AUTH_ROLE, type AuthRole } from "@dongle/types/auth/auth-role";

type VerifiedPageAccess = {
    accessToken: string;
    claims: JwtPayload;
};

type AdminPageAccessOptions = {
    clubId?: string | number;
};

type ServerPageAccessOptions = AdminPageAccessOptions & {
    role?: AuthRole;
};

function parsePositiveInteger(value: unknown): number | null {
    const parsed =
        typeof value === "number"
            ? value
            : typeof value === "string" && /^\d+$/.test(value)
              ? Number(value)
              : NaN;
    return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

// Middleware refreshes cookies before rendering. Data loaders enforce access again.
async function requireServerPageAccess(
    options: ServerPageAccessOptions = {}
): Promise<VerifiedPageAccess> {
    const accessToken = await getAccessTokenFromServerCookie();

    if (!accessToken) {
        redirect("/login?reason=no_token");
    }

    const claims = await verifyJwtToken(accessToken);
    if (!claims) {
        redirect("/login?reason=invalid_token");
    }

    if (options.role && claims.role !== options.role) {
        const claimClubId = parsePositiveInteger(claims.club_id);
        if (claims.role === AUTH_ROLE.PRESIDENT && claimClubId !== null) {
            redirect(`/${claimClubId}/club-form`);
        }
        redirect("/login?reason=unauthorized");
    }

    if (options.clubId !== undefined) {
        const requestedClubId = parsePositiveInteger(options.clubId);
        if (requestedClubId === null) {
            notFound();
        }
        if (
            claims.role !== AUTH_ROLE.ADMIN &&
            (claims.role !== AUTH_ROLE.PRESIDENT || parsePositiveInteger(claims.club_id) !== requestedClubId)
        ) {
            redirect("/login?reason=unauthorized_club");
        }
    }

    return { accessToken, claims };
}

export function requireAdminPageAccess(options: AdminPageAccessOptions = {}) {
    return requireServerPageAccess({ ...options, role: AUTH_ROLE.ADMIN });
}

export function requireClubPageAccess(options: Required<AdminPageAccessOptions>) {
    return requireServerPageAccess(options);
}

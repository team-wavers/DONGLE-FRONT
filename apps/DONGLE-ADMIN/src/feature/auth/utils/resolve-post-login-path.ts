import { AUTH_ROLE } from "@dongle/types/auth/auth-role";
import { normalizeInternalReturnTo } from "./normalize-internal-return-to";

export type ResolvePostLoginPathInput = {
    role?: string;
    clubId?: string;
    returnTo?: string | null;
};

export type ResolvePostLoginPathResult =
    | { ok: true; path: string }
    | { ok: false; reason: "no_club" };

export function resolvePostLoginPath({
    role,
    clubId,
    returnTo,
}: ResolvePostLoginPathInput): ResolvePostLoginPathResult {
    const safeReturnTo = normalizeInternalReturnTo(returnTo ?? null);
    if (safeReturnTo) {
        return { ok: true, path: safeReturnTo };
    }

    if (role === AUTH_ROLE.ADMIN) {
        return { ok: true, path: "/admin" };
    }

    if (clubId) {
        return { ok: true, path: `/${clubId}/club-form` };
    }

    return { ok: false, reason: "no_club" };
}

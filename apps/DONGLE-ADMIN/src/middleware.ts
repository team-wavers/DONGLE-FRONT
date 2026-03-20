// middleware.ts 예제
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decodeJwtToken, isTokenExpired } from "@dongle/api/utils/jwt.util";
import { AUTH_ROLE } from "@dongle/types/auth/auth-role";
import { handleTokenRefresh } from "@/lib/middleware/tokenRefresh.middleware";

const PUBLIC_ROUTES = ["/login", "/club-register", "/sentry-example-page"];
const ADMIN_ROUTES = ["/admin"];

function redirectToLogin(request: NextRequest, reason: string) {
    return NextResponse.redirect(new URL(`/login?reason=${reason}`, request.url));
}

function tryRefreshOrRedirect(request: NextRequest, refreshToken: string | undefined, reason: string) {
    if (refreshToken) {
        return handleTokenRefresh(request, refreshToken);
    }

    return redirectToLogin(request, reason);
}

export async function middleware(request: NextRequest) {
    const isPublic = PUBLIC_ROUTES.some((route) => request.nextUrl.pathname.startsWith(route));
    const isAdminRoute = ADMIN_ROUTES.some((route) => request.nextUrl.pathname.startsWith(route));

    if (isPublic) {
        return NextResponse.next();
    }

    // 쿠키 확인
    const accessToken = request.cookies.get("accessToken");
    const refreshToken = request.cookies.get("refreshToken");

    if (!accessToken) {
        return tryRefreshOrRedirect(request, refreshToken?.value, "no_token");
    }

    if (isTokenExpired(accessToken.value)) {
        return tryRefreshOrRedirect(request, refreshToken?.value, "expired");
    }

    const payload = decodeJwtToken(accessToken.value);
    if (!payload) {
        return tryRefreshOrRedirect(request, refreshToken?.value, "invalid_token");
    }

    const role = payload.role || null;
    const clubId =
        typeof payload.club_id === "string"
            ? payload.club_id
            : typeof payload.club_id === "number"
              ? String(payload.club_id)
              : null;

    // 루트 경로 처리
    if (request.nextUrl.pathname === "/") {
        if (role === AUTH_ROLE.ADMIN) {
            return NextResponse.redirect(new URL("/admin", request.url));
        }
        if (role === AUTH_ROLE.PRESIDENT && clubId) {
            return NextResponse.redirect(new URL(`/${clubId}/club-form`, request.url));
        }
        return redirectToLogin(request, "no_role");
    }

    // 관리자 경로 접근 권한 확인
    if (isAdminRoute) {
        if (role === AUTH_ROLE.ADMIN) {
            return NextResponse.next();
        }
        if (role === AUTH_ROLE.PRESIDENT && clubId) {
            return NextResponse.redirect(new URL(`/${clubId}/club-form`, request.url));
        }
        return redirectToLogin(request, "unauthorized");
    }

    // 기타 경로는 통과
    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|mockServiceWorker.js|.*.png$|.*.svg$).*)"],
};

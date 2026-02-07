// middleware.ts 예제
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUserClubIdFromToken, getUserRoleFromToken, isTokenExpired } from "@dongle/api/utils/jwt.util";
import { handleTokenRefresh } from "./lib/middleware/tokenRefresh.middleware";

const PUBLIC_ROUTES = ["/login", "/club-register", "/change-password"];
const ADMIN_ROUTES = ["/admin"];

export async function middleware(request: NextRequest) {
    const isPublic = PUBLIC_ROUTES.some((route) => request.nextUrl.pathname.startsWith(route));

    if (isPublic) {
        return NextResponse.next();
    }

    // 쿠키 확인
    const accessToken = request.cookies.get("accessToken");

    if (!accessToken) {
        const refreshToken = request.cookies.get("refreshToken");
        if (refreshToken) {
            return await handleTokenRefresh(request, refreshToken.value);
        }
        return NextResponse.redirect(new URL("/login?reason=no_token", request.url));
    }

    // 토큰 만료 확인
    if (isTokenExpired(accessToken.value)) {
        const refreshToken = request.cookies.get("refreshToken");
        if (refreshToken) {
            return await handleTokenRefresh(request, refreshToken.value);
        }
        return NextResponse.redirect(new URL("/login?reason=expired", request.url));
    }

    const role = getUserRoleFromToken(accessToken.value);
    const clubId = getUserClubIdFromToken(accessToken.value);

    // 토큰 디코딩 실패 또는 role/clubId가 없는 경우
    if (!role) {
        const refreshToken = request.cookies.get("refreshToken");
        if (refreshToken) {
            return await handleTokenRefresh(request, refreshToken.value);
        }
        return NextResponse.redirect(new URL("/login?reason=invalid_token", request.url));
    }

    // 루트 경로 처리
    if (request.nextUrl.pathname === "/") {
        if (role === "admin") {
            return NextResponse.redirect(new URL("/admin", request.url));
        }
        if (role === "club") {
            return NextResponse.redirect(new URL(`/${clubId}/club-form`, request.url));
        }
        return NextResponse.redirect(new URL("/login?reason=no_role", request.url));
    }

    // 관리자 경로 접근 권한 확인
    const isAdminRoute = ADMIN_ROUTES.some((route) => request.nextUrl.pathname.startsWith(route));

    if (isAdminRoute) {
        if (role === "admin") {
            return NextResponse.next();
        }
        if (role === "club") {
            return NextResponse.redirect(new URL(`/${clubId}/club-form`, request.url));
        }
        return NextResponse.redirect(new URL("/login?reason=unauthorized", request.url));
    }

    // 기타 경로는 통과
    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|mockServiceWorker.js|.*.png$|.*.svg$).*)"],
};

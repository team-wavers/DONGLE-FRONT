// middleware.ts 예제
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUserClubIdFromToken, getUserRoleFromToken } from "@dongle/api/utils/jwt.util";

const PUBLIC_ROUTES = ["/login", "/club-register"];
const ADMIN_ROUTES = ["/admin"];

export async function middleware(request: NextRequest) {
    const isPublic = PUBLIC_ROUTES.some((route) => request.nextUrl.pathname.startsWith(route));
    const isAdminRoute = ADMIN_ROUTES.some((route) => request.nextUrl.pathname.startsWith(route));

    if (isPublic) {
        return NextResponse.next();
    }

    // 쿠키 확인
    const accessToken = request.cookies.get("accessToken");

    if (!accessToken) {
        return NextResponse.redirect(new URL("/login?reason=no_token", request.url));
    }

    // 루트 경로 처리
    if (request.nextUrl.pathname === "/") {
        const role = getUserRoleFromToken(accessToken.value);
        const clubId = getUserClubIdFromToken(accessToken.value);

        if (role === "admin") {
            return NextResponse.redirect(new URL("/admin", request.url));
        }
        if (role === "club") {
            return NextResponse.redirect(new URL(`/${clubId}/club-form`, request.url));
        }
        return NextResponse.redirect(new URL("/login?reason=no_role", request.url));
    }

    // 관리자 경로 접근 권한 확인
    if (isAdminRoute) {
        const role = getUserRoleFromToken(accessToken.value);
        const clubId = getUserClubIdFromToken(accessToken.value);

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

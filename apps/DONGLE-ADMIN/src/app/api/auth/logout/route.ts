import { NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME } from "@dongle/api/utils/cookie/cookie.contant";
import { logoutService } from "@dongle/service/auth/auth.service";

export async function POST() {
    try {
        await logoutService();
    } catch {
        // 로컬 세션 삭제가 실제 사용자 로그아웃을 결정하므로 API 실패는 사용자 흐름을 막지 않는다.
    }

    const response = NextResponse.json({ success: true });
    response.cookies.delete(ACCESS_TOKEN_COOKIE_NAME);
    response.cookies.delete(REFRESH_TOKEN_COOKIE_NAME);

    return response;
}

"use server";

import { cookies } from "next/headers";
import { logoutService } from "@dongle/service/auth/auth.service";

/** 서버 로그아웃 API 실패 여부와 관계없이 로컬 세션 쿠키를 삭제한다. */
export async function logoutAction() {
    try {
        await logoutService();
    } catch {
        // 로컬 세션 삭제가 실제 사용자 로그아웃을 결정하므로 API 실패는 사용자 흐름을 막지 않는다.
    } finally {
        const cookieStore = await cookies();
        cookieStore.delete("accessToken");
        cookieStore.delete("refreshToken");
    }

    return { success: true };
}

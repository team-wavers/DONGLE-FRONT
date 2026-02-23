"use server";

import { cookies } from "next/headers";
import { logoutService } from "@dongle/service/auth/auth.service";

/** 성공/실패와 관계없이 항상 쿠키를 삭제하고, API 결과만 반환 */
export async function logoutAction() {
    let success = false;
    try {
        const res = await logoutService();
        success = res.isSuccess;
    } finally {
        const cookieStore = await cookies();
        cookieStore.delete("accessToken");
        cookieStore.delete("refreshToken");
    }
    return { success };
}

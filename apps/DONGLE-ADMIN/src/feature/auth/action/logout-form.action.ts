"use server";

import { cookies } from "next/headers";
import { logoutService } from "@dongle/service/auth/auth.service";

export async function logoutAction() {
    const res = await logoutService();
    if (!res.isSuccess) return { success: false };

    const cookieStore = await cookies();

    cookieStore.delete("accessToken");
    cookieStore.delete("refreshToken");

    return { success: true };
}

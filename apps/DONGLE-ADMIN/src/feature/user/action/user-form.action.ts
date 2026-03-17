"use server";

import { deleteUserService } from "@dongle/service/user/user.service";
import { revalidateTag } from "next/cache";
import { requireServerActionAccessToken } from "@/feature/shared/action/server-action-auth";

// 사용자 삭제 서버 액션
export async function deleteUserAction(userId: number): Promise<{
    success: boolean;
    error?: string;
}> {
    try {
        await requireServerActionAccessToken();

        const result = await deleteUserService(userId);

        if (!result.isSuccess) {
            return {
                success: false,
                error: "사용자 삭제에 실패했습니다. 다시 시도해주세요.",
            };
        }

        // 사용자 정보 캐시 초기화
        revalidateTag("user");
        revalidateTag(`user-${userId}`);

        return { success: true };
    } catch (error: unknown) {
        console.error("사용자 삭제 중 오류:", error);
        const message =
            error instanceof Error
                ? error.message
                : typeof error === "object" &&
                    error !== null &&
                    "message" in error &&
                    typeof (error as { message: unknown }).message === "string"
                  ? (error as { message: string }).message
                  : "사용자 삭제 중 오류가 발생했습니다. 다시 시도해주세요.";
        return {
            success: false,
            error: message,
        };
    }
}

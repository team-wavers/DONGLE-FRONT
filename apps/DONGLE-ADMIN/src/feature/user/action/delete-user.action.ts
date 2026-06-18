"use server";

import { deleteUserService } from "@dongle/service/user/user.service";
import { userTagGroups } from "@dongle/service";
import { getUserIdFromToken } from "@dongle/api/utils/jwt.util";
import { actionFailure, actionSuccess, requireServerActionAccessToken, type ActionResult } from "@/shared/action";
import { captureServerException } from "@/lib/sentry/capture-server-exception";
import { revalidateTags } from "@/lib/server/revalidate-tags";

// 사용자 삭제 서버 액션
export async function deleteUserAction(userId: number): Promise<ActionResult<string, null>> {
    try {
        const accessToken = await requireServerActionAccessToken();
        const tokenUserId = getUserIdFromToken(accessToken);

        if (tokenUserId === null) {
            return actionFailure({ formError: "사용자 정보를 가져올 수 없습니다." });
        }

        const currentUserId = Number(tokenUserId);

        if (!Number.isFinite(currentUserId)) {
            return actionFailure({ formError: "사용자 정보를 가져올 수 없습니다." });
        }

        if (currentUserId === userId) {
            return actionFailure({ formError: "본인 계정은 삭제할 수 없습니다." });
        }

        const result = await deleteUserService(userId);

        if (!result.isSuccess) {
            return actionFailure({ formError: "사용자 삭제에 실패했습니다. 다시 시도해주세요." });
        }

        // 사용자 정보 캐시 초기화
        revalidateTags(userTagGroups.detail(userId));

        return actionSuccess({ data: null, message: "사용자가 성공적으로 삭제되었습니다." });
    } catch (error: unknown) {
        captureServerException(error, "사용자 삭제 중 오류", {
            action: "deleteUserAction",
            userId,
        });
        const message =
            error instanceof Error
                ? error.message
                : typeof error === "object" &&
                    error !== null &&
                    "message" in error &&
                    typeof (error as { message: unknown }).message === "string"
                  ? (error as { message: string }).message
                  : "사용자 삭제 중 오류가 발생했습니다. 다시 시도해주세요.";
        return actionFailure({ formError: message });
    }
}

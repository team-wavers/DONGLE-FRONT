"use server";

import { deleteClubService } from "@dongle/service/club/club.service";
import { clubTagGroups } from "@dongle/service";
import { actionFailure, actionSuccess, requireServerActionAccessToken, type ActionResult } from "@/shared/action";
import { captureServerException } from "@/lib/sentry/capture-server-exception";
import { revalidateTags } from "@/lib/server/revalidate-tags";

function getActionErrorMessage(error: unknown, fallback: string): string {
    return error instanceof Error && error.message ? error.message : fallback;
}

export async function deleteClubAction(clubId: number): Promise<ActionResult<string, null>> {
    try {
        await requireServerActionAccessToken();

        const result = await deleteClubService(clubId);

        if (!result.isSuccess) {
            return actionFailure({
                formError:
                    result.error?.detail || result.error?.message || "동아리 삭제에 실패했습니다. 다시 시도해주세요.",
            });
        }

        revalidateTags(clubTagGroups.detail(clubId));

        return actionSuccess({
            data: null,
            message: "동아리가 성공적으로 삭제되었습니다.",
            redirectTo: "/admin/club",
        });
    } catch (error) {
        captureServerException(error, "동아리 삭제 중 오류", {
            action: "deleteClubAction",
            clubId,
        });
        return actionFailure({
            formError: getActionErrorMessage(error, "동아리 삭제 중 오류가 발생했습니다. 다시 시도해주세요."),
        });
    }
}

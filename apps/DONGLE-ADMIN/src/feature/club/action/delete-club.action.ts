"use server";

import { deleteClubService } from "@dongle/service/club/club.service";
import { clubTagGroups } from "@dongle/service";
import {
    actionFailure,
    actionSuccess,
    getActionErrorMessage,
    getServiceErrorMessage,
    requireServerActionAccessToken,
    type ActionResult,
} from "@/shared/action";
import { captureServerException } from "@/lib/sentry/capture-server-exception";
import { revalidateTags } from "@/lib/server/revalidate-tags";

export async function deleteClubAction(clubId: number): Promise<ActionResult<string, null>> {
    try {
        await requireServerActionAccessToken();

        const result = await deleteClubService(clubId);

        if (!result.isSuccess) {
            return actionFailure({
                formError: getServiceErrorMessage(result.error, "동아리 삭제에 실패했습니다. 다시 시도해주세요."),
            });
        }

        revalidateTags(clubTagGroups.detail(clubId));

        return actionSuccess({
            data: null,
            message: "동아리가 성공적으로 삭제되었습니다. 공개 화면 반영까지 최대 120초 정도 걸릴 수 있어요.",
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

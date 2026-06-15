"use server";

import { deleteMainBannerService } from "@dongle/service/main-banner/main-banner.service";
import { mainBannerTagGroups } from "@dongle/service";
import { requireServerActionAccessToken } from "@/shared/action/server-action-auth";
import { revalidateTags } from "@/lib/server/revalidate-tags";
import { captureServerException } from "@/lib/sentry/capture-server-exception";
import { actionFailure, actionSuccess, type ActionResult } from "@/shared/action";

export async function deleteMainBannerAction(id: number): Promise<ActionResult<string, null>> {
    if (!Number.isFinite(id)) {
        return actionFailure({
            formError: "삭제할 배너 정보를 찾을 수 없습니다.",
        });
    }

    try {
        await requireServerActionAccessToken();

        const response = await deleteMainBannerService(id);

        if (!response.isSuccess) {
            return actionFailure({
                formError: response.error?.message || "배너 삭제에 실패했습니다.",
            });
        }

        revalidateTags(mainBannerTagGroups.detail(id));

        return actionSuccess({
            data: null,
            message: "배너가 삭제되었습니다.",
            redirectTo: "/admin/banner",
        });
    } catch (error) {
        captureServerException(error, "배너 삭제 중 오류", {
            action: "deleteMainBannerAction",
            bannerId: id,
        });

        return actionFailure({
            formError: error instanceof Error && error.message ? error.message : "배너 삭제 중 오류가 발생했습니다.",
        });
    }
}

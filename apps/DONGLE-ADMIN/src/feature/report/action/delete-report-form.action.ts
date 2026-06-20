"use server";

import { deleteClubReportService } from "@dongle/service/club/club.report.service";
import { reportTagGroups } from "@dongle/service";
import { actionFailure, actionSuccess, requireServerActionAccessToken, type ActionResult } from "@/shared/action";
import { captureServerException } from "@/lib/sentry/capture-server-exception";
import { revalidateTags } from "@/lib/server/revalidate-tags";

/** 활동 보고서 삭제 서버 액션 */
export async function deleteReportAction(clubId: number, reportId: number): Promise<ActionResult<string, null>> {
    try {
        await requireServerActionAccessToken();

        const result = await deleteClubReportService(clubId, reportId);

        if (!result.isSuccess) {
            return actionFailure({ formError: "보고서 삭제에 실패했습니다. 다시 시도해주세요." });
        }

        revalidateTags(reportTagGroups.item(clubId, reportId));

        return actionSuccess({
            data: null,
            message: "활동 보고서가 성공적으로 삭제되었습니다.",
            redirectTo: `/${clubId}/report`,
        });
    } catch (error) {
        captureServerException(error, "보고서 삭제 중 오류", {
            action: "deleteReportAction",
            clubId,
            reportId,
        });
        return actionFailure({ formError: "보고서 삭제 중 오류가 발생했습니다. 다시 시도해주세요." });
    }
}

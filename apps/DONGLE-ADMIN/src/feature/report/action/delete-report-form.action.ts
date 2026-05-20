"use server";

import { deleteClubReportService } from "@dongle/service/club/club.report.service";
import { reportTagGroups } from "@dongle/service";
import { requireServerActionAccessToken } from "@/shared/action/server-action-auth";
import { captureServerException } from "@/lib/sentry/capture-server-exception";
import { revalidateTags } from "@/lib/server/revalidate-tags";

/** 활동 보고서 삭제 서버 액션 */
export async function deleteReportAction(
    clubId: number,
    reportId: number
): Promise<{ success: boolean; error?: string }> {
    try {
        await requireServerActionAccessToken();

        const result = await deleteClubReportService(clubId, reportId);

        if (!result.isSuccess) {
            return {
                success: false,
                error: "보고서 삭제에 실패했습니다. 다시 시도해주세요.",
            };
        }

        revalidateTags(reportTagGroups.item(clubId, reportId));

        return { success: true };
    } catch (error) {
        captureServerException(error, "보고서 삭제 중 오류", {
            action: "deleteReportAction",
            clubId,
            reportId,
        });
        return {
            success: false,
            error: "보고서 삭제 중 오류가 발생했습니다. 다시 시도해주세요.",
        };
    }
}

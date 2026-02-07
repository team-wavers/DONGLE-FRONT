"use server";

import { deleteClubReportService } from "@dongle/service/club/club.report.service";
import { revalidateTag } from "next/cache";

/** 활동 보고서 삭제 서버 액션 */
export async function deleteReportAction(
    clubId: number,
    reportId: number
): Promise<{ success: boolean; error?: string }> {
    try {
        const result = await deleteClubReportService(clubId, reportId);

        if (!result.isSuccess) {
            return {
                success: false,
                error: "보고서 삭제에 실패했습니다. 다시 시도해주세요.",
            };
        }

        revalidateTag("report");
        revalidateTag(`report-${clubId}`);

        return { success: true };
    } catch (error) {
        console.error("보고서 삭제 중 오류:", error);
        return {
            success: false,
            error: "보고서 삭제 중 오류가 발생했습니다. 다시 시도해주세요.",
        };
    }
}

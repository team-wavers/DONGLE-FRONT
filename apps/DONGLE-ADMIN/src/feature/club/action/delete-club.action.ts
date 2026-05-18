"use server";

import { deleteClubService } from "@dongle/service/club/club.service";
import { revalidateTag } from "next/cache";
import { requireServerActionAccessToken } from "@/shared/action/server-action-auth";
import { captureServerException } from "@/lib/sentry/capture-server-exception";

function getActionErrorMessage(error: unknown, fallback: string): string {
    return error instanceof Error && error.message ? error.message : fallback;
}

export async function deleteClubAction(clubId: number): Promise<{
    success: boolean;
    error?: string;
}> {
    try {
        await requireServerActionAccessToken();

        const result = await deleteClubService(clubId);

        if (!result.isSuccess) {
            return {
                success: false,
                error:
                    result.error?.detail || result.error?.message || "동아리 삭제에 실패했습니다. 다시 시도해주세요.",
            };
        }

        revalidateTag("club");
        revalidateTag(`club-${clubId}`);

        return { success: true };
    } catch (error) {
        captureServerException(error, "동아리 삭제 중 오류", {
            action: "deleteClubAction",
            clubId,
        });
        return {
            success: false,
            error: getActionErrorMessage(error, "동아리 삭제 중 오류가 발생했습니다. 다시 시도해주세요."),
        };
    }
}

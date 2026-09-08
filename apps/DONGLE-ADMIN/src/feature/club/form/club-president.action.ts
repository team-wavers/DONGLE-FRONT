"use server";

import { patchUserService } from "@dongle/service/user/user.service";
import { clubTagGroups, userTagGroups } from "@dongle/service";
import { actionFailure, actionSuccess, getServiceErrorMessage, getZodFieldErrors, type ActionResult } from "@/shared/action";
import { requireServerActionAccessToken } from "@/shared/action/server-action-auth";
import { captureServerException } from "@/lib/sentry/capture-server-exception";
import { revalidateTags } from "@/lib/server/revalidate-tags";
import { getSessionExpiredActionFailure } from "@/shared/action";
import { clubPresidentSchema, type ClubPresidentField, type ClubPresidentFormValues } from "./club-president.schema";

type ClubPresidentActionResult = ActionResult<ClubPresidentField>;

export async function submitClubPresidentAction({
    clubId,
    presidentId,
    values,
}: {
    clubId: string;
    presidentId: number;
    values: ClubPresidentFormValues;
}): Promise<ClubPresidentActionResult> {
    const normalizedClubId = clubId.trim();

    if (!normalizedClubId || !Number.isFinite(presidentId)) {
        return actionFailure({
            formError: "회장 정보를 찾을 수 없습니다.",
        });
    }

    const parsed = clubPresidentSchema.safeParse(values);

    if (!parsed.success) {
        return actionFailure({
            fieldErrors: getZodFieldErrors<ClubPresidentField>(parsed.error),
            formError: "회장 정보를 다시 확인해주세요.",
        });
    }

    try {
        await requireServerActionAccessToken({ clubId: normalizedClubId });

        const { isSuccess, error } = await patchUserService(presidentId, {
            name: parsed.data.presidentName,
            phone: parsed.data.presidentContact,
        });

        if (!isSuccess) {
            const expired = getSessionExpiredActionFailure(error);
            if (expired) return actionFailure(expired);
            return actionFailure({
                formError: getServiceErrorMessage(error, "회장 정보 수정에 실패했습니다."),
            });
        }

        revalidateTags(userTagGroups.detail(presidentId));
        revalidateTags(clubTagGroups.detail(normalizedClubId));

        return actionSuccess({
            message: "회장 정보가 성공적으로 수정되었습니다! 공개 화면 반영까지 최대 120초 정도 걸릴 수 있어요.",
        });
    } catch (error) {
        const expired = getSessionExpiredActionFailure(error);
        if (expired) return actionFailure(expired);

        captureServerException(error, "회장 정보 수정 중 오류", {
            action: "submitClubPresidentAction",
            clubId: normalizedClubId,
            presidentId,
        });

        return actionFailure({
            formError: error instanceof Error && error.message ? error.message : "회장 정보 수정에 실패했습니다. 다시 시도해주세요.",
        });
    }
}

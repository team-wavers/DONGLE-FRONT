"use server";

import { updateClubService, uploadClubIconService } from "@dongle/service/club/club.service";
import { clubTagGroups } from "@dongle/service";
import { actionFailure, actionSuccess, getZodFieldErrors, type ActionResult } from "@/shared/action";
import { requireServerActionAccessToken } from "@/shared/action/server-action-auth";
import { captureServerException } from "@/lib/sentry/capture-server-exception";
import { revalidateTags } from "@/lib/server/revalidate-tags";
import { clubEditSchema, type ClubEditField, type ClubEditFormValues } from "./club-edit.schema";
import { buildClubEditPayload } from "./club-edit-payload";

interface ClubEditSuccessData {
    iconUrl?: string | null;
}

type ClubEditActionResult = ActionResult<ClubEditField, ClubEditSuccessData>;

function extractUploadedIconUrl(result: unknown): string | undefined {
    if (typeof result === "string" && result.trim()) {
        return result;
    }

    if (result && typeof result === "object") {
        const iconUrl = (result as { icon_url?: unknown }).icon_url;
        if (typeof iconUrl === "string" && iconUrl.trim()) {
            return iconUrl;
        }
    }

    return undefined;
}

function getActionErrorMessage(error: unknown, fallback: string): string {
    return error instanceof Error && error.message ? error.message : fallback;
}

export async function submitClubEditAction({
    clubId,
    values,
}: {
    clubId: string;
    values: ClubEditFormValues;
}): Promise<ClubEditActionResult> {
    const normalizedClubId = clubId.trim();
    const numericClubId = Number(normalizedClubId);

    if (!normalizedClubId || !Number.isFinite(numericClubId)) {
        return actionFailure({
            formError: "동아리 정보를 찾을 수 없습니다.",
        });
    }

    const parsed = clubEditSchema.safeParse(values);

    if (!parsed.success) {
        return actionFailure({
            fieldErrors: getZodFieldErrors<ClubEditField>(parsed.error),
            formError: "동아리 정보를 다시 확인해주세요.",
        });
    }

    try {
        await requireServerActionAccessToken();

        const iconFile = parsed.data.iconFile;
        let iconUrl: string | null | undefined;

        if (iconFile && iconFile.size > 0) {
            const iconUploadResult = await uploadClubIconService(numericClubId, iconFile);

            if (!iconUploadResult.isSuccess) {
                return actionFailure({
                    formError: "아이콘 업로드에 실패했습니다. 다시 시도해주세요.",
                    fieldErrors: {
                        iconFile: "아이콘 업로드에 실패했습니다. 다시 시도해주세요.",
                    },
                });
            }

            iconUrl = extractUploadedIconUrl(iconUploadResult.result);
            if (!iconUrl) {
                return actionFailure({
                    formError: "아이콘 업로드 결과를 확인할 수 없습니다. 다시 시도해주세요.",
                    fieldErrors: {
                        iconFile: "아이콘 업로드 결과를 확인할 수 없습니다. 다시 시도해주세요.",
                    },
                });
            }
        } else if (parsed.data.iconUrls.length === 0) {
            iconUrl = null;
        }

        const { isSuccess, error } = await updateClubService(numericClubId, buildClubEditPayload(parsed.data, iconUrl));

        if (!isSuccess) {
            return actionFailure({
                formError: error?.detail || error?.message || "동아리 수정에 실패했습니다.",
            });
        }

        revalidateTags(clubTagGroups.detail(normalizedClubId));

        return actionSuccess({
            data: iconUrl !== undefined ? { iconUrl } : undefined,
            message: "동아리 정보가 성공적으로 수정되었습니다!",
        });
    } catch (error) {
        if (error instanceof Error && error.message === "Unauthorized") {
            return actionFailure({
                formError: "로그인 시간이 만료되었습니다. 다시 로그인해주세요.",
                sessionExpired: true,
            });
        }

        captureServerException(error, "동아리 수정 중 오류", {
            action: "submitClubEditAction",
            clubId: normalizedClubId,
        });

        return actionFailure({
            formError: getActionErrorMessage(error, "동아리 수정에 실패했습니다. 다시 시도해주세요."),
        });
    }
}

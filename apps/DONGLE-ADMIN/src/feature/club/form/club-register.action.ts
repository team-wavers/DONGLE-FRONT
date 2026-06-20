"use server";

import { createClubService, updateClubService, uploadClubIconService } from "@dongle/service/club/club.service";
import { createUserService } from "@dongle/service/user/user.service";
import { clubTagGroups, userTagGroups } from "@dongle/service";
import type { CreateClubRequest } from "@dongle/types/club/club.response";
import { normalizeSocialUrl } from "@dongle/ui/utils";
import { RECRUITMENT_STATUS } from "@/feature/club/constants/club.constants";
import { clubRegisterSchema, splitTags, type ClubRegisterField, type ClubRegisterFormValues } from "./club-register.schema";
import { actionFailure, actionSuccess, getServiceErrorMessage, getZodFieldErrors, type ActionResult } from "@/shared/action";
import { requireServerActionAccessToken } from "@/shared/action/server-action-auth";
import { captureServerException } from "@/lib/sentry/capture-server-exception";
import { revalidateTags } from "@/lib/server/revalidate-tags";

export interface ClubRegisterSuccessData {
    tempId: string;
    tempPassword: string;
    clubName: string;
    warningMessage?: string;
}

type ClubRegisterActionResult = ActionResult<ClubRegisterField, ClubRegisterSuccessData>;

function generateTempId(): string {
    const randomNum = Math.floor(Math.random() * 999999) + 100000;

    return `dongle${randomNum}`;
}

function normalizeClubSnsPayload(instagram: string, youtube: string) {
    return {
        instagram: normalizeSocialUrl("instagram", instagram) ?? instagram,
        youtube: normalizeSocialUrl("youtube", youtube) ?? youtube,
    };
}

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

export async function submitClubRegisterAction(
    registrationKey: string,
    values: ClubRegisterFormValues
): Promise<ClubRegisterActionResult> {
    const key = registrationKey.trim();

    if (!key) {
        return actionFailure({
            formError: "등록 키가 필요합니다.",
        });
    }

    const parsed = clubRegisterSchema.safeParse(values);

    if (!parsed.success) {
        return actionFailure({
            fieldErrors: getZodFieldErrors(parsed.error),
            formError: "동아리 등록 내용을 다시 확인해주세요.",
        });
    }

    try {
        await requireServerActionAccessToken();

        const tempId = generateTempId();
        const tempPassword = tempId;
        const data = parsed.data;

        const user = await createUserService({
            name: data.presidentName,
            login_id: tempId,
            password: tempPassword,
            role: "president",
            phone: data.presidentContact,
        });

        if (!user.isSuccess || !user.result?.id) {
            return actionFailure({
                formError: getServiceErrorMessage(user.error, "사용자 등록에 실패했습니다. 다시 시도해주세요."),
            });
        }

        const isRecruiting = data.recruitmentStatus === RECRUITMENT_STATUS.RECRUITING;
        const clubPayload: CreateClubRequest = {
            key,
            name: data.clubName,
            category: data.category,
            tags: splitTags(data.tags),
            description: data.description,
            main_activities: data.main_activities,
            sns: normalizeClubSnsPayload(data.instagram, data.youtube),
            is_recruiting: isRecruiting,
            president_id: user.result.id,
            location: data.location,
            ...(isRecruiting && {
                recruit_start: data.recruitmentStartDate,
                recruit_end: data.recruitmentEndDate,
            }),
        };

        const club = await createClubService(clubPayload);

        if (!club.isSuccess) {
            return actionFailure({
                formError: getServiceErrorMessage(club.error, "동아리 등록에 실패했습니다. 다시 시도해주세요."),
            });
        }

        let warningMessage: string | undefined;
        const createdClubId = club.result?.id;
        const iconFile = data.iconFile;

        if (createdClubId && iconFile && iconFile.size > 0) {
            const iconUploadResult = await uploadClubIconService(createdClubId, iconFile);

            if (iconUploadResult.isSuccess) {
                const uploadedIconUrl = extractUploadedIconUrl(iconUploadResult.result);
                if (!uploadedIconUrl) {
                    warningMessage = "동아리는 등록되었지만 아이콘 업로드 결과를 확인하지 못했습니다.";
                } else {
                    const iconUpdateResult = await updateClubService(createdClubId, {
                        icon_url: uploadedIconUrl,
                    });

                    if (!iconUpdateResult.isSuccess) {
                        warningMessage = "동아리는 등록되었지만 아이콘 저장에 실패했습니다.";
                    }
                }
            } else {
                warningMessage = "동아리는 등록되었지만 아이콘 업로드에 실패했습니다.";
            }
        }

        revalidateTags(userTagGroups.detail(user.result.id));
        if (createdClubId) {
            revalidateTags(clubTagGroups.detail(createdClubId));
        } else {
            revalidateTags(clubTagGroups.list());
        }

        return actionSuccess({
            data: {
                tempId,
                tempPassword,
                clubName: data.clubName,
                warningMessage,
            },
        });
    } catch (error) {
        if (error instanceof Error && error.message === "Unauthorized") {
            return actionFailure({
                formError: "로그인 시간이 만료되었습니다. 다시 로그인해주세요.",
                sessionExpired: true,
            });
        }

        captureServerException(error, "동아리 등록 중 오류", {
            action: "submitClubRegisterAction",
            registrationKey: key,
        });

        return actionFailure({
            formError: error instanceof Error && error.message ? error.message : "동아리 등록에 실패했습니다. 다시 시도해주세요.",
        });
    }
}

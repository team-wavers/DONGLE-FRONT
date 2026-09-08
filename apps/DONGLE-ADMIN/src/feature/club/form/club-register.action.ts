"use server";

import { createClubService, updateClubService, uploadClubIconService } from "@dongle/service/club/club.service";
import { clubTagGroups, userTagGroups } from "@dongle/service";
import type { CreateClubRequest } from "@dongle/types/club/club.response";
import { normalizeSocialUrl } from "@dongle/utils";
import { RECRUITMENT_STATUS } from "@/feature/club/constants/club.constants";
import { clubRegisterSchema, splitTags, type ClubRegisterField, type ClubRegisterFormValues } from "./club-register.schema";
import { actionFailure, actionSuccess, getServiceErrorMessage, getZodFieldErrors, type ActionResult } from "@/shared/action";
import { captureServerException } from "@/lib/sentry/capture-server-exception";
import { revalidateTags } from "@/lib/server/revalidate-tags";
import { cookies } from "next/headers";

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
        const tempId = generateTempId();
        const tempPassword = tempId;
        const data = parsed.data;

        // 회장 계정 생성과 동아리 생성을 한 번의 요청으로 묶는다 — 백엔드가
        // 하나의 트랜잭션으로 처리하므로, 키가 무효/만료라 동아리 생성이
        // 실패해도 회장 계정이 고아로 남지 않는다.
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
            newPresident: {
                name: data.presidentName,
                login_id: tempId,
                password: tempPassword,
                phone: data.presidentContact,
            },
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

        revalidateTags(userTagGroups.list());
        if (createdClubId) {
            revalidateTags(clubTagGroups.detail(createdClubId));
        } else {
            revalidateTags(clubTagGroups.list());
        }

        const flashData = {
                tempId,
                tempPassword,
                clubName: data.clubName,
                warningMessage,
        };
        const cookieStore = await cookies();
        cookieStore.set("clubRegisterSuccess", Buffer.from(JSON.stringify(flashData)).toString("base64url"), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/club-register/register-success",
            maxAge: 300,
        });

        return actionSuccess({
            redirectTo: "/club-register/register-success",
        });
    } catch (error) {
        captureServerException(error, "동아리 등록 중 오류", {
            action: "submitClubRegisterAction",
            registrationKey: key,
        });

        return actionFailure({
            formError: error instanceof Error && error.message ? error.message : "동아리 등록에 실패했습니다. 다시 시도해주세요.",
        });
    }
}

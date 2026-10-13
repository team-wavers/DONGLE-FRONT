"use server";

import { createClubService } from "@dongle/service/club/club.service";
import { clubTagGroups, userTagGroups } from "@dongle/service";
import type { CreateClubRequest } from "@dongle/types/club/club.response";
import { API_ERROR_CODE } from "@dongle/types";
import { normalizeSocialUrl } from "@dongle/utils";
import { RECRUITMENT_STATUS } from "@/feature/club/constants/club.constants";
import { clubRegisterSchema, splitTags, type ClubRegisterField, type ClubRegisterFormValues } from "./club-register.schema";
import { actionFailure, actionSuccess, getServiceErrorMessage, getZodFieldErrors, type ActionResult } from "@/shared/action";
import { captureServerException } from "@/lib/sentry/capture-server-exception";
import { revalidateTags } from "@/lib/server/revalidate-tags";
type ClubRegisterActionResult = ActionResult<ClubRegisterField>;

function normalizeClubSnsPayload(instagram: string, youtube: string) {
    return {
        ...(instagram && { instagram: normalizeSocialUrl("instagram", instagram) ?? instagram }),
        ...(youtube && { youtube: normalizeSocialUrl("youtube", youtube) ?? youtube }),
    };
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
                login_id: data.loginId,
                password: data.password,
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
            const code = club.error?.code;
            const message = club.error?.message;

            if (code === API_ERROR_CODE.LOGIN_ID_DUPLICATED) {
                return actionFailure({
                    fieldErrors: { loginId: message?.trim() || "이미 사용 중인 로그인 아이디입니다." },
                });
            }

            if (code === API_ERROR_CODE.PHONE_DUPLICATED) {
                return actionFailure({
                    fieldErrors: { presidentContact: message?.trim() || "이미 사용 중인 전화번호입니다." },
                });
            }

            return actionFailure({
                formError: getServiceErrorMessage(club.error, "동아리 등록에 실패했습니다. 다시 시도해주세요."),
            });
        }

        revalidateTags(userTagGroups.list());
        revalidateTags(clubTagGroups.list());

        return actionSuccess({
            redirectTo: "/club-register/register-success",
        });
    } catch (error) {
        captureServerException(error, "동아리 등록 중 오류", {
            action: "submitClubRegisterAction",
            registrationKey: key,
        });

        return actionFailure({
            formError: "동아리 등록에 실패했습니다. 다시 시도해주세요.",
        });
    }
}

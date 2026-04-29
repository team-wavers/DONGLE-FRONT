"use server";

import {
    createClubService,
    updateClubService,
    deleteClubService,
    uploadClubIconService,
} from "@dongle/service/club/club.service";
import { createUserService, patchUserService } from "@dongle/service/user/user.service";
import { revalidateTag } from "next/cache";
import { RECRUITMENT_STATUS } from "@/feature/club/constants/club.constants";
import {
    isValidPhoneNumber,
    normalizeRecruitmentStatus,
    validateClubForm,
    type ClubFormData,
    type ClubFormFieldErrors,
} from "@/feature/club/validation/club-form.validation";
import { requireServerActionAccessToken } from "@/feature/shared/action/server-action-auth";
import { trimToEmpty, trimToNull } from "@/feature/shared/normalization/string-normalization";
import { captureServerException } from "@/lib/sentry/capture-server-exception";
import { normalizeSocialUrl } from "@dongle/ui/utils";

interface ClubActionState {
    success?: boolean;
    error?: string;
    warningMessage?: string;
    sessionExpired?: boolean;
    tempId?: string;
    tempPassword?: string;
    clubName?: string;
    fieldErrors?: ClubFormFieldErrors;
}

function getActionErrorMessage(error: unknown, fallback: string): string {
    return error instanceof Error && error.message ? error.message : fallback;
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

function getFirstFieldErrorMessage(fieldErrors: ClubActionState["fieldErrors"], fallback: string): string {
    if (!fieldErrors) {
        return fallback;
    }

    for (const value of Object.values(fieldErrors)) {
        if (typeof value === "string" && value.trim()) {
            return value;
        }
    }

    return fallback;
}

function getTrimmedString(formData: FormData, key: string): string {
    return trimToEmpty(formData.get(key));
}

function parseStringArrayField(formData: FormData, key: string): string[] {
    const raw = getTrimmedString(formData, key) || "[]";
    try {
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

function normalizeClubSnsPayload(instagram: string, youtube: string) {
    return {
        instagram: normalizeSocialUrl("instagram", instagram) ?? trimToEmpty(instagram),
        youtube: normalizeSocialUrl("youtube", youtube) ?? trimToEmpty(youtube),
    };
}

// 공통 폼 데이터 추출 함수
function extractClubFormData(formData: FormData): ClubFormData {
    const rawTags = formData
        .getAll("tags")
        .map((tag) => String(tag))
        .filter((tag) => trimToEmpty(tag).length > 0);

    const parsedTags = rawTags
        .flatMap((tag) => tag.split(","))
        .map((tag) => trimToEmpty(tag))
        .filter((tag) => tag.length > 0);

    return {
        clubName: formData.get("clubName") as string,
        category: formData.get("category") as string,
        recruitmentStatus: normalizeRecruitmentStatus(formData.get("recruitmentStatus") as string),
        location: formData.get("location") as string,
        presidentName: formData.get("presidentName") as string,
        presidentContact: formData.get("presidentContact") as string,
        tags: parsedTags,
        main_activities: formData.get("main_activities") as string,
        description: formData.get("description") as string,
        recruitmentStartDate: formData.get("recruitmentStartDate") as string,
        recruitmentEndDate: formData.get("recruitmentEndDate") as string,
        instagram: formData.get("instagram") as string,
        youtube: formData.get("youtube") as string,
    };
}

export async function clubFormAction(prevState: ClubActionState, formData: FormData): Promise<ClubActionState> {
    const clubId = formData.get("clubId") as string;

    if (!clubId) {
        return {
            success: false,
            error: "동아리 정보를 찾을 수 없습니다.",
        };
    }

    const extractedData = extractClubFormData(formData);
    const { fieldErrors, isValid } = validateClubForm(extractedData, { requirePresident: false });

    if (!isValid) {
        return {
            fieldErrors,
            success: false,
            error: getFirstFieldErrorMessage(fieldErrors, "동아리 정보를 다시 확인해주세요."),
        };
    }

    // 선택적 필드만 포함 (빈 값 제외)
    const clubPayload: {
        name?: string;
        tags?: string[];
        description?: string;
        main_activities?: string;
        recruit_start?: string | null;
        recruit_end?: string | null;
        category?: string;
        location?: string;
        icon_url?: string | null;
        is_recruiting?: boolean;
        sns?: {
            youtube?: string;
            instagram?: string;
        };
    } = {};

    // 필드가 있고 빈 값이 아닌 경우만 추가
    if (extractedData.clubName && extractedData.clubName.trim()) {
        clubPayload.name = extractedData.clubName;
    }
    // 태그
    if (extractedData.tags && extractedData.tags.length > 0) {
        clubPayload.tags = extractedData.tags;
    }
    // 동아리 설명
    if (extractedData.description && extractedData.description.trim()) {
        clubPayload.description = extractedData.description;
    }
    // 주요 활동
    if (extractedData.main_activities && extractedData.main_activities.trim()) {
        clubPayload.main_activities = extractedData.main_activities;
    }
    // 분과
    if (extractedData.category && extractedData.category.trim()) {
        clubPayload.category = extractedData.category;
    }
    // 동아리 방 정보
    if (extractedData.location && extractedData.location.trim()) {
        clubPayload.location = extractedData.location;
    }
    // 모집 여부
    clubPayload.is_recruiting = extractedData.recruitmentStatus === RECRUITMENT_STATUS.RECRUITING;
    // 모집기간은 모집중일 때만 유지하고, 아니면 명시적으로 제거한다.
    if (clubPayload.is_recruiting) {
        clubPayload.recruit_start = trimToNull(extractedData.recruitmentStartDate);
        clubPayload.recruit_end = trimToNull(extractedData.recruitmentEndDate);
    } else {
        clubPayload.recruit_start = null;
        clubPayload.recruit_end = null;
    }

    // SNS 필드가 하나라도 있으면 추가
    clubPayload.sns = normalizeClubSnsPayload(extractedData.instagram, extractedData.youtube);
    try {
        await requireServerActionAccessToken();

        // 아이콘 파일 업로드 (있는 경우)
        const iconFile = formData.get("icon") as File | null;
        const existingIconUrls = parseStringArrayField(formData, "icon_existing_urls");

        if ((!iconFile || iconFile.size === 0) && existingIconUrls.length === 0) {
            clubPayload.icon_url = null;
        }

        if (iconFile && iconFile.size > 0) {
            const iconUploadResult = await uploadClubIconService(Number(clubId), iconFile);
            if (!iconUploadResult.isSuccess) {
                return {
                    success: false,
                    error: "아이콘 업로드에 실패했습니다. 다시 시도해주세요.",
                    fieldErrors: {
                        icon: "아이콘 업로드에 실패했습니다. 다시 시도해주세요.",
                    },
                };
            }

            const uploadedIconUrl = extractUploadedIconUrl(iconUploadResult.result);
            if (!uploadedIconUrl) {
                return {
                    success: false,
                    error: "아이콘 업로드 결과를 확인할 수 없습니다. 다시 시도해주세요.",
                    fieldErrors: {
                        icon: "아이콘 업로드 결과를 확인할 수 없습니다. 다시 시도해주세요.",
                    },
                };
            }

            clubPayload.icon_url = uploadedIconUrl;
        }

        const { isSuccess: clubIsSuccess, error: clubError } = await updateClubService(Number(clubId), clubPayload);

        if (!clubIsSuccess) {
            return {
                success: false,
                error: clubError?.detail || clubError?.message || "동아리 수정에 실패했습니다.",
            };
        }

        // 동아리 및 사용자 정보 캐시 초기화
        revalidateTag("club");
        revalidateTag(`club-${clubId}`);

        return { success: true };
    } catch (error) {
        if (error instanceof Error && error.message === "Unauthorized") {
            return {
                success: false,
                error: "로그인 시간이 만료되었습니다. 다시 로그인해주세요.",
                sessionExpired: true,
            };
        }

        captureServerException(error, "동아리 수정 중 오류", {
            action: "clubFormAction",
            clubId,
        });
        return {
            success: false,
            error: getActionErrorMessage(error, "동아리 수정에 실패했습니다. 다시 시도해주세요."),
        };
    }
}

export async function updateClubPresidentAction(
    prevState: ClubActionState,
    formData: FormData
): Promise<ClubActionState> {
    const clubId = getTrimmedString(formData, "clubId");
    const presidentId = getTrimmedString(formData, "presidentId");
    const presidentName = getTrimmedString(formData, "presidentName");
    const presidentContact = getTrimmedString(formData, "presidentContact");

    if (!clubId || !presidentId) {
        return {
            success: false,
            error: "회장 정보를 찾을 수 없습니다.",
        };
    }

    const fieldErrors: ClubActionState["fieldErrors"] = {};
    if (!presidentName) {
        fieldErrors.presidentName = "회장 이름을 입력해주세요";
    }
    if (!presidentContact) {
        fieldErrors.presidentContact = "회장 연락처를 입력해주세요";
    } else if (!isValidPhoneNumber(presidentContact)) {
        fieldErrors.presidentContact = "올바른 휴대폰 번호 형식이 아닙니다 (예: 010-1234-5678)";
    }

    if (Object.keys(fieldErrors).length > 0) {
        return {
            fieldErrors,
            success: false,
            error: getFirstFieldErrorMessage(fieldErrors, "회장 정보를 다시 확인해주세요."),
        };
    }

    try {
        await requireServerActionAccessToken();

        const { isSuccess: userIsSuccess, error: userError } = await patchUserService(Number(presidentId), {
            name: presidentName,
            phone: presidentContact,
        });

        if (!userIsSuccess) {
            return {
                success: false,
                error: userError?.detail || userError?.message || "회장 정보 수정에 실패했습니다.",
            };
        }

        revalidateTag("user");
        revalidateTag(`user-${presidentId}`);
        revalidateTag("club");
        revalidateTag(`club-${clubId}`);

        return { success: true };
    } catch (error) {
        if (error instanceof Error && error.message === "Unauthorized") {
            return {
                success: false,
                error: "로그인 시간이 만료되었습니다. 다시 로그인해주세요.",
                sessionExpired: true,
            };
        }

        captureServerException(error, "회장 정보 수정 중 오류", {
            action: "updateClubPresidentAction",
            clubId,
            presidentId,
        });
        return {
            success: false,
            error: getActionErrorMessage(error, "회장 정보 수정에 실패했습니다. 다시 시도해주세요."),
        };
    }
}

export async function clubRegisterFormAction(prevState: ClubActionState, formData: FormData): Promise<ClubActionState> {
    const registrationKey = formData.get("registrationKey") as string;
    if (!registrationKey) {
        return {
            success: false,
            error: "등록 키가 필요합니다.",
        };
    }

    const extractedData = extractClubFormData(formData);
    const { fieldErrors, isValid } = validateClubForm(extractedData);

    if (!isValid) {
        return {
            fieldErrors,
            success: false,
            error: getFirstFieldErrorMessage(fieldErrors, "동아리 등록 내용을 다시 확인해주세요."),
        };
    }

    try {
        await requireServerActionAccessToken();

        const tempId = generateTempId();
        const tempPassword = tempId;

        const user = await createUserService({
            name: extractedData.presidentName,
            login_id: tempId,
            password: tempPassword,
            role: "president",
            phone: extractedData.presidentContact,
        });
        if (!user.isSuccess) {
            return {
                success: false,
                error: user.error?.detail || user.error?.message || "사용자 등록에 실패했습니다. 다시 시도해주세요.",
            };
        }

        const clubPayload = {
            key: registrationKey,
            name: extractedData.clubName,
            category: extractedData.category,
            tags: extractedData.tags,
            description: extractedData.description,
            main_activities: extractedData.main_activities,
            sns: normalizeClubSnsPayload(extractedData.instagram, extractedData.youtube),
            is_recruiting: extractedData.recruitmentStatus === RECRUITMENT_STATUS.RECRUITING,
            president_id: user.result?.id,
            location: extractedData.location,
            ...(extractedData.recruitmentStatus === RECRUITMENT_STATUS.RECRUITING &&
                extractedData.recruitmentStartDate.trim() && { recruit_start: extractedData.recruitmentStartDate }),
            ...(extractedData.recruitmentStatus === RECRUITMENT_STATUS.RECRUITING &&
                extractedData.recruitmentEndDate.trim() && { recruit_end: extractedData.recruitmentEndDate }),
        };

        const club = await createClubService(clubPayload);

        if (!club.isSuccess) {
            return {
                success: false,
                error: club.error?.detail || club.error?.message || "동아리 등록에 실패했습니다. 다시 시도해주세요.",
            };
        }

        let warningMessage: string | undefined;
        const createdClubId = club.result?.id;
        const iconFile = formData.get("icon") as File | null;

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

        // // 새 동아리 등록 시 모든 동아리 관련 캐시 초기화
        // revalidateTag("club");

        // const updatedClub = await updateClubService(club.result?.id, {
        //   president_id: Number(user.result.id),
        // });
        // if (!updatedClub.isSuccess) {
        //   return {
        //     success: false,
        //     error: "동아리-회장 연동에 실패했습니다. 다시 시도해주세요.",
        //   };
        // }

        return {
            success: true,
            warningMessage,
            tempId,
            tempPassword,
            clubName: extractedData.clubName,
        };
    } catch (error) {
        if (error instanceof Error && error.message === "Unauthorized") {
            return {
                success: false,
                error: "로그인 시간이 만료되었습니다. 다시 로그인해주세요.",
                sessionExpired: true,
            };
        }

        captureServerException(error, "동아리 등록 중 오류", {
            action: "clubRegisterFormAction",
            registrationKey,
        });
        return {
            success: false,
            error: getActionErrorMessage(error, "동아리 등록에 실패했습니다. 다시 시도해주세요."),
        };
    }
}

// 임시 아이디 생성 함수
function generateTempId(): string {
    const randomNum = Math.floor(Math.random() * 999999) + 100000;

    return `dongle${randomNum}`;
}

// 동아리 삭제 서버 액션
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

        // 동아리 정보 캐시 초기화
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

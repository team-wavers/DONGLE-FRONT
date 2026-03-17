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
import { requireServerActionAccessToken } from "@/feature/shared/action/server-action-auth";

// 휴대폰 번호 검증 함수
function isValidPhoneNumber(phoneNumber: string): boolean {
    // 공백 제거
    const cleaned = phoneNumber.replace(/\s/g, "");

    // 한국 휴대폰 번호 패턴 (010, 011, 016, 017, 018, 019)
    const phoneRegex = /^01[0-9]-?\d{3,4}-?\d{4}$/;

    return phoneRegex.test(cleaned);
}

interface ClubActionState {
    success?: boolean;
    error?: string;
    tempId?: string;
    tempPassword?: string;
    clubName?: string;
    fieldErrors?: {
        clubName?: string;
        recruitmentStatus?: string;
        department?: string;
        location?: string;
        presidentName?: string;
        presidentContact?: string;
        recruitmentStartDate?: string;
        recruitmentEndDate?: string;
        description?: string;
        main_activities?: string;
        category?: string;
        icon?: string;
    };
}

interface ClubFormData {
    clubName: string;
    category: string;
    recruitmentStatus: string;
    tags: string[];
    main_activities: string;
    description: string;
    location: string;
    recruitmentStartDate: string;
    recruitmentEndDate: string;
    instagram: string;
    youtube: string;
    presidentName: string;
    presidentContact: string;
}

function getActionErrorMessage(error: unknown, fallback: string): string {
    return error instanceof Error && error.message ? error.message : fallback;
}

function normalizeRecruitmentStatus(status?: string | null): string {
    const trimmed = String(status ?? "").trim();

    if (trimmed === RECRUITMENT_STATUS.RECRUITING || trimmed === "모집중") {
        return RECRUITMENT_STATUS.RECRUITING;
    }

    if (trimmed === RECRUITMENT_STATUS.CLOSED || trimmed === "모집마감") {
        return RECRUITMENT_STATUS.CLOSED;
    }

    return trimmed;
}

function getTrimmedString(formData: FormData, key: string): string {
    return String(formData.get(key) || "").trim();
}

function parseStringArrayField(formData: FormData, key: string): string[] {
    const raw = getTrimmedString(formData, key) || "[]";
    try {
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

// 공통 검증 함수
function validateClubForm(
    formData: ClubFormData,
    options?: {
        requirePresident?: boolean;
    }
): {
    fieldErrors: ClubActionState["fieldErrors"];
    isValid: boolean;
} {
    const fieldErrors: ClubActionState["fieldErrors"] = {};
    const requirePresident = options?.requirePresident ?? true;
    const normalizedRecruitmentStatus = normalizeRecruitmentStatus(formData.recruitmentStatus);
    const isRecruiting = normalizedRecruitmentStatus === RECRUITMENT_STATUS.RECRUITING;

    if (!formData.category) {
        fieldErrors.category = "분과를 선택해주세요";
    }

    if (!formData.clubName) {
        fieldErrors.clubName = "동아리 이름을 입력해주세요";
    }

    if (!formData.location) {
        fieldErrors.location = "동아리 방 정보를 입력해주세요.";
    }

    if (!formData.recruitmentStatus) {
        fieldErrors.recruitmentStatus = "모집여부를 선택해주세요";
    }

    if (!formData.description) {
        fieldErrors.description = "동아리 설명을 입력해주세요";
    }

    if (!formData.main_activities) {
        fieldErrors.main_activities = "주요 활동을 입력해주세요";
    }

    if (requirePresident) {
        if (!formData.presidentName) {
            fieldErrors.presidentName = "회장 이름을 입력해주세요";
        }

        if (!formData.presidentContact) {
            fieldErrors.presidentContact = "회장 연락처를 입력해주세요";
        } else if (!isValidPhoneNumber(formData.presidentContact)) {
            fieldErrors.presidentContact = "올바른 휴대폰 번호 형식이 아닙니다 (예: 010-1234-5678)";
        }
    }

    // 모집중일 때는 모집기간 필수, 모집마감일 때는 선택 입력
    if (isRecruiting) {
        if (!formData.recruitmentStartDate) {
            fieldErrors.recruitmentStartDate = "모집 시작일을 입력해주세요";
        }
        if (!formData.recruitmentEndDate) {
            fieldErrors.recruitmentEndDate = "모집 마감일을 입력해주세요";
        }
    }

    // 모집기간이 둘 다 있는 경우 날짜 순서 검증
    if (formData.recruitmentStartDate && formData.recruitmentEndDate) {
        const startDate = new Date(formData.recruitmentStartDate);
        const endDate = new Date(formData.recruitmentEndDate);
        if (startDate > endDate) {
            fieldErrors.recruitmentEndDate = "모집 마감일은 모집 시작일보다 늦어야 합니다";
        }
    }

    return {
        fieldErrors,
        isValid: Object.keys(fieldErrors).length === 0,
    };
}

// 공통 폼 데이터 추출 함수
function extractClubFormData(formData: FormData): ClubFormData {
    const rawTags = formData
        .getAll("tags")
        .map((tag) => String(tag))
        .filter((tag) => tag.trim().length > 0);

    const parsedTags = rawTags
        .flatMap((tag) => tag.split(","))
        .map((tag) => tag.trim())
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
        return { fieldErrors };
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
        clubPayload.recruit_start = extractedData.recruitmentStartDate?.trim() || null;
        clubPayload.recruit_end = extractedData.recruitmentEndDate?.trim() || null;
    } else {
        clubPayload.recruit_start = null;
        clubPayload.recruit_end = null;
    }

    // SNS 필드가 하나라도 있으면 추가
    const sns: { youtube?: string; instagram?: string } = {};
    if (extractedData.youtube && extractedData.youtube.trim()) {
        sns.youtube = extractedData.youtube;
    }
    if (extractedData.instagram && extractedData.instagram.trim()) {
        sns.instagram = extractedData.instagram;
    }
    if (Object.keys(sns).length > 0) {
        clubPayload.sns = sns;
    }
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
                    fieldErrors: {
                        icon: "아이콘 업로드에 실패했습니다. 다시 시도해주세요.",
                    },
                };
            }
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
        return { fieldErrors };
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
            error: "등록에 실패했습니다. 다시 시도해주세요.",
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
            sns: {
                youtube: extractedData.youtube,
                instagram: extractedData.instagram,
            },
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
            tempId,
            tempPassword,
            clubName: extractedData.clubName,
        };
    } catch (error) {
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
        console.error("동아리 삭제 중 오류:", error);
        return {
            success: false,
            error: getActionErrorMessage(error, "동아리 삭제 중 오류가 발생했습니다. 다시 시도해주세요."),
        };
    }
}

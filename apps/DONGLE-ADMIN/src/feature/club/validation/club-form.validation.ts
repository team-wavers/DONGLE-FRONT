import { RECRUITMENT_STATUS } from "@/feature/club/constants/club.constants";
import { isValidMobilePhoneNumber } from "@/feature/shared/normalization/string-normalization";

export interface ClubFormFieldErrors {
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
}

export interface ClubFormData {
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

function stripRichTextMarkup(value: string): string {
    return value.replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/\s+/g, " ").trim();
}

export function hasMeaningfulRichText(value: string): boolean {
    return stripRichTextMarkup(value).length > 0;
}

export function isValidPhoneNumber(phoneNumber: string): boolean {
    return isValidMobilePhoneNumber(phoneNumber);
}

export function normalizeRecruitmentStatus(status?: string | null): string {
    const trimmed = String(status ?? "").trim();

    if (trimmed === RECRUITMENT_STATUS.RECRUITING || trimmed === "모집중") {
        return RECRUITMENT_STATUS.RECRUITING;
    }

    if (trimmed === RECRUITMENT_STATUS.CLOSED || trimmed === "모집마감") {
        return RECRUITMENT_STATUS.CLOSED;
    }

    return trimmed;
}

export function validateClubForm(
    formData: ClubFormData,
    options?: {
        requirePresident?: boolean;
    }
): {
    fieldErrors: ClubFormFieldErrors;
    isValid: boolean;
} {
    const fieldErrors: ClubFormFieldErrors = {};
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

    if (!hasMeaningfulRichText(formData.description)) {
        fieldErrors.description = "동아리 설명을 입력해주세요";
    }

    if (!hasMeaningfulRichText(formData.main_activities)) {
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

    if (isRecruiting) {
        if (!formData.recruitmentStartDate) {
            fieldErrors.recruitmentStartDate = "모집 시작일을 입력해주세요";
        }
        if (!formData.recruitmentEndDate) {
            fieldErrors.recruitmentEndDate = "모집 마감일을 입력해주세요";
        }
    }

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

import { z } from "zod";
import type { Club } from "@dongle/types/club/club.d";
import { trimToEmpty } from "@dongle/utils";
import { RECRUITMENT_STATUS } from "@/feature/club/constants/club.constants";
import { hasMeaningfulRichText, normalizeRecruitmentStatus } from "@/feature/club/validation/club-form.validation";

export const clubEditSchema = z
    .object({
        clubName: z.string().transform(trimToEmpty),
        recruitmentStatus: z.string().transform((value) => normalizeRecruitmentStatus(value)),
        category: z.string().transform(trimToEmpty),
        location: z.string().transform(trimToEmpty),
        description: z.string().transform(trimToEmpty),
        main_activities: z.string().transform(trimToEmpty),
        tags: z.string().transform(trimToEmpty),
        recruitmentStartDate: z.string().transform(trimToEmpty),
        recruitmentEndDate: z.string().transform(trimToEmpty),
        instagram: z.string().transform(trimToEmpty),
        youtube: z.string().transform(trimToEmpty),
        iconUrls: z.array(z.string()),
        iconFile: z.custom<File | null>().nullable().optional(),
    })
    .superRefine((value, context) => {
        if (!value.clubName) {
            context.addIssue({ code: z.ZodIssueCode.custom, path: ["clubName"], message: "동아리 이름을 입력해주세요" });
        }
        if (!value.category) {
            context.addIssue({ code: z.ZodIssueCode.custom, path: ["category"], message: "분과를 선택해주세요" });
        }
        if (!value.location) {
            context.addIssue({ code: z.ZodIssueCode.custom, path: ["location"], message: "동아리 방 정보를 입력해주세요." });
        }
        if (!value.recruitmentStatus) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["recruitmentStatus"],
                message: "모집여부를 선택해주세요",
            });
        }
        if (!hasMeaningfulRichText(value.description)) {
            context.addIssue({ code: z.ZodIssueCode.custom, path: ["description"], message: "동아리 설명을 입력해주세요" });
        }
        if (!hasMeaningfulRichText(value.main_activities)) {
            context.addIssue({ code: z.ZodIssueCode.custom, path: ["main_activities"], message: "주요 활동을 입력해주세요" });
        }

        if (value.recruitmentStatus === RECRUITMENT_STATUS.RECRUITING) {
            if (!value.recruitmentStartDate) {
                context.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["recruitmentStartDate"],
                    message: "모집 시작일을 입력해주세요",
                });
            }
            if (!value.recruitmentEndDate) {
                context.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["recruitmentEndDate"],
                    message: "모집 마감일을 입력해주세요",
                });
            }
        }

        if (value.recruitmentStartDate && value.recruitmentEndDate) {
            const startDate = new Date(value.recruitmentStartDate);
            const endDate = new Date(value.recruitmentEndDate);

            if (startDate > endDate) {
                context.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["recruitmentEndDate"],
                    message: "모집 마감일은 모집 시작일보다 늦어야 합니다",
                });
            }
        }
    });

export type ClubEditFormValues = z.infer<typeof clubEditSchema>;
export type ClubEditField = keyof ClubEditFormValues;

export function splitClubEditTags(tags: string): string[] {
    return tags
        .split(",")
        .map((tag) => trimToEmpty(tag))
        .filter((tag) => tag.length > 0);
}

export function createClubEditDefaultValues(club: Club): ClubEditFormValues {
    return {
        clubName: club.name ?? "",
        recruitmentStatus: club.is_recruiting ? RECRUITMENT_STATUS.RECRUITING : RECRUITMENT_STATUS.CLOSED,
        category: club.category ?? "",
        location: club.location ?? "",
        description: club.description ?? "",
        main_activities: club.main_activities ?? "",
        tags: club.tags.join(", "),
        recruitmentStartDate: club.recruit_start ?? "",
        recruitmentEndDate: club.recruit_end ?? "",
        instagram: club.sns?.instagram ?? "",
        youtube: club.sns?.youtube ?? "",
        iconUrls: club.icon_url ? [club.icon_url] : [],
        iconFile: null,
    };
}

export function createClubEditDraftValues(values: ClubEditFormValues): ClubEditFormValues {
    return {
        ...values,
        iconFile: null,
    };
}

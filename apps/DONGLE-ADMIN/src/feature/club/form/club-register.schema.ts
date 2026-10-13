import { z } from "zod";
import { RECRUITMENT_STATUS } from "@/feature/club/constants/club.constants";
import { hasMeaningfulRichText, isValidPhoneNumber, normalizeRecruitmentStatus } from "@/feature/club/validation/club-form.validation";
import { trimToEmpty } from "@dongle/utils";

export const clubRegisterSchema = z
    .object({
        clubName: z.string().transform(trimToEmpty).pipe(z.string().min(1, "동아리 이름을 입력해주세요")),
        category: z.string().transform(trimToEmpty).pipe(z.string().min(1, "분과를 선택해주세요")),
        recruitmentStatus: z
            .string()
            .transform((value) => normalizeRecruitmentStatus(value))
            .pipe(z.string().min(1, "모집여부를 선택해주세요")),
        location: z.string().transform(trimToEmpty).pipe(z.string().min(1, "동아리 방 정보를 입력해주세요")),
        description: z.string().refine(hasMeaningfulRichText, { message: "동아리 설명을 입력해주세요" }),
        main_activities: z.string().refine(hasMeaningfulRichText, { message: "주요 활동을 입력해주세요" }),
        presidentName: z.string().transform(trimToEmpty).pipe(z.string().min(1, "회장 이름을 입력해주세요")),
        presidentContact: z
            .string()
            .transform(trimToEmpty)
            .refine((value) => value.length > 0, { message: "회장 연락처를 입력해주세요" })
            .refine(isValidPhoneNumber, {
                message: "올바른 휴대폰 번호 형식이 아닙니다 (예: 010-1234-5678)",
            }),
        loginId: z
            .string()
            .transform(trimToEmpty)
            .pipe(z.string().regex(/^[a-z0-9]{4,20}$/, "아이디는 영문 소문자와 숫자 4~20자로 입력해주세요")),
        password: z
            .string()
            .min(8, "비밀번호는 8~72자로 입력해주세요")
            .max(72, "비밀번호는 8~72자로 입력해주세요")
            .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, "비밀번호에 영문과 숫자를 모두 포함해주세요"),
        passwordConfirm: z.string(),
        recruitmentStartDate: z.string().transform(trimToEmpty),
        recruitmentEndDate: z.string().transform(trimToEmpty),
        instagram: z.string().transform(trimToEmpty),
        youtube: z.string().transform(trimToEmpty),
        tags: z.string().transform(trimToEmpty),
    })
    .superRefine((values, ctx) => {
        if (values.password !== values.passwordConfirm) {
            ctx.addIssue({
                code: "custom",
                path: ["passwordConfirm"],
                message: "비밀번호가 일치하지 않습니다",
            });
        }

        const isRecruiting = values.recruitmentStatus === RECRUITMENT_STATUS.RECRUITING;

        if (isRecruiting && !values.recruitmentStartDate) {
            ctx.addIssue({
                code: "custom",
                path: ["recruitmentStartDate"],
                message: "모집 시작일을 입력해주세요",
            });
        }

        if (isRecruiting && !values.recruitmentEndDate) {
            ctx.addIssue({
                code: "custom",
                path: ["recruitmentEndDate"],
                message: "모집 마감일을 입력해주세요",
            });
        }

        if (values.recruitmentStartDate && values.recruitmentEndDate) {
            const startDate = new Date(values.recruitmentStartDate);
            const endDate = new Date(values.recruitmentEndDate);

            if (startDate >= endDate) {
                ctx.addIssue({
                    code: "custom",
                    path: ["recruitmentEndDate"],
                    message: "모집 마감일은 모집 시작일보다 늦어야 합니다",
                });
            }
        }
    });

export type ClubRegisterFormValues = z.infer<typeof clubRegisterSchema>;

export const CLUB_REGISTER_DEFAULT_VALUES: ClubRegisterFormValues = {
    clubName: "",
    category: "",
    recruitmentStatus: RECRUITMENT_STATUS.CLOSED,
    location: "",
    description: "",
    main_activities: "",
    presidentName: "",
    presidentContact: "",
    loginId: "",
    password: "",
    passwordConfirm: "",
    recruitmentStartDate: "",
    recruitmentEndDate: "",
    instagram: "",
    youtube: "",
    tags: "",
};

export type ClubRegisterField = keyof ClubRegisterFormValues;

export function splitTags(tags: string): string[] {
    return tags
        .split(",")
        .map((tag) => trimToEmpty(tag))
        .filter(Boolean);
}

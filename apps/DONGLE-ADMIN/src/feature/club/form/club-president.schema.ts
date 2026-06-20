import { z } from "zod";
import { trimToEmpty } from "@dongle/utils";
import { isValidPhoneNumber } from "@/feature/club/validation/club-form.validation";

export const clubPresidentSchema = z
    .object({
        presidentName: z.string().transform(trimToEmpty),
        presidentContact: z.string().transform(trimToEmpty),
    })
    .superRefine((value, context) => {
        if (!value.presidentName) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["presidentName"],
                message: "회장 이름을 입력해주세요",
            });
        }

        if (!value.presidentContact) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["presidentContact"],
                message: "회장 연락처를 입력해주세요",
            });
            return;
        }

        if (!isValidPhoneNumber(value.presidentContact)) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["presidentContact"],
                message: "올바른 휴대폰 번호 형식이 아닙니다 (예: 010-1234-5678)",
            });
        }
    });

export type ClubPresidentFormValues = z.infer<typeof clubPresidentSchema>;
export type ClubPresidentField = keyof ClubPresidentFormValues;

export function createClubPresidentDefaultValues(values?: Partial<ClubPresidentFormValues>): ClubPresidentFormValues {
    return {
        presidentName: values?.presidentName ?? "",
        presidentContact: values?.presidentContact ?? "",
    };
}

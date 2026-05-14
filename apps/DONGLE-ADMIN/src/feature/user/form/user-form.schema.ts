import { z } from "zod";
import type { UpdateUserRequest, User } from "@dongle/types/user/user.d";
import { trimToEmpty } from "@dongle/utils";
import {
    validateLoginId,
    validatePassword,
    validateUserName,
    validateUserPhone,
} from "@/feature/user/validation/user-form.validation";

const userFormBaseSchema = z.object({
    name: z.string().transform(trimToEmpty),
    login_id: z.string().transform(trimToEmpty),
    password: z.string(),
    phone: z.string().transform(trimToEmpty),
});

function refineUserForm(requiredPassword: boolean) {
    return (value: z.infer<typeof userFormBaseSchema>, context: z.RefinementCtx) => {
        const nameError = validateUserName(value.name);
        if (nameError) {
            context.addIssue({ code: z.ZodIssueCode.custom, path: ["name"], message: nameError });
        }

        const loginIdError = validateLoginId(value.login_id);
        if (loginIdError) {
            context.addIssue({ code: z.ZodIssueCode.custom, path: ["login_id"], message: loginIdError });
        }

        const passwordError = validatePassword(value.password, requiredPassword);
        if (passwordError) {
            context.addIssue({ code: z.ZodIssueCode.custom, path: ["password"], message: passwordError });
        }

        const phoneError = validateUserPhone(value.phone);
        if (phoneError) {
            context.addIssue({ code: z.ZodIssueCode.custom, path: ["phone"], message: phoneError });
        }
    };
}

export const userCreateSchema = userFormBaseSchema.superRefine(refineUserForm(true));

export const userEditSchema = userFormBaseSchema.superRefine(refineUserForm(false));

export type UserCreateFormValues = z.infer<typeof userCreateSchema>;
export type UserEditFormValues = z.infer<typeof userEditSchema>;
export type UserCreateField = keyof UserCreateFormValues;
export type UserEditField = keyof UserEditFormValues;

export const USER_CREATE_DEFAULT_VALUES: UserCreateFormValues = {
    name: "",
    login_id: "",
    password: "",
    phone: "",
};

export function createUserEditDefaultValues(user: User): UserEditFormValues {
    return {
        name: user.name ?? "",
        login_id: user.login_id ?? "",
        password: "",
        phone: user.phone ?? "",
    };
}

export function buildUserEditPayload(values: UserEditFormValues, original: UserEditFormValues): UpdateUserRequest {
    const payload: UpdateUserRequest = {};

    if (values.name !== original.name) {
        payload.name = values.name;
    }

    if (values.login_id !== original.login_id) {
        payload.login_id = values.login_id;
    }

    if (values.phone !== original.phone) {
        payload.phone = values.phone;
    }

    if (trimToEmpty(values.password)) {
        payload.password = values.password;
    }

    return payload;
}

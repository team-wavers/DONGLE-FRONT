"use server";

import { createUserService } from "@dongle/service/user/user.service";
import { revalidateTag } from "next/cache";
import {
    validateUserName,
    validateLoginId,
    validatePassword,
    validateUserRole,
    validateUserPhone,
    type UserFormFieldErrors,
} from "@/feature/user/validation/user-form.validation";

export interface UserCreateActionState {
    success?: boolean;
    error?: string;
    fieldErrors?: UserFormFieldErrors;
}

export async function userCreateFormAction(
    _prevState: UserCreateActionState,
    formData: FormData
): Promise<UserCreateActionState> {
    const name = (formData.get("name") as string)?.trim() ?? "";
    const login_id = (formData.get("login_id") as string)?.trim() ?? "";
    const password = (formData.get("password") as string) ?? "";
    const role = (formData.get("role") as string) ?? "";
    const phone = (formData.get("phone") as string)?.trim() ?? "";

    const fieldErrors: UserFormFieldErrors = {};
    const nameError = validateUserName(name);
    if (nameError) fieldErrors.name = nameError;
    const loginIdError = validateLoginId(login_id);
    if (loginIdError) fieldErrors.login_id = loginIdError;
    const passwordError = validatePassword(password, true);
    if (passwordError) fieldErrors.password = passwordError;
    const roleError = validateUserRole(role);
    if (roleError) fieldErrors.role = roleError;
    const phoneError = validateUserPhone(phone);
    if (phoneError) fieldErrors.phone = phoneError;

    if (Object.keys(fieldErrors).length > 0) {
        return { fieldErrors };
    }

    try {
        const { isSuccess, error } = await createUserService({
            name,
            login_id,
            password,
            role: role as "admin" | "president",
            phone,
        });

        if (!isSuccess) {
            return {
                success: false,
                error: error?.message ?? "사용자 생성에 실패했습니다. 다시 시도해주세요.",
            };
        }

        revalidateTag("user");

        return { success: true };
    } catch (err) {
        console.error("사용자 생성 중 오류:", err);
        const message =
            err instanceof Error ? err.message : "사용자 생성 중 오류가 발생했습니다. 다시 시도해주세요.";
        return {
            success: false,
            error: message,
        };
    }
}

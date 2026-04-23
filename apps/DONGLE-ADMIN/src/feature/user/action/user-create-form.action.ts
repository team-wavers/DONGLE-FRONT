"use server";

import { createUserService } from "@dongle/service/user/user.service";
import { revalidateTag } from "next/cache";
import { requireServerActionAccessToken } from "@/feature/shared/action/server-action-auth";
import {
    validateUserName,
    validateLoginId,
    validatePassword,
    validateUserPhone,
    type UserFormFieldErrors,
} from "@/feature/user/validation/user-form.validation";
import { captureServerException } from "@/lib/sentry/capture-server-exception";

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
    const phone = (formData.get("phone") as string)?.trim() ?? "";
    const role = "admin";

    const fieldErrors: UserFormFieldErrors = {};
    const nameError = validateUserName(name);
    if (nameError) fieldErrors.name = nameError;
    const loginIdError = validateLoginId(login_id);
    if (loginIdError) fieldErrors.login_id = loginIdError;
    const passwordError = validatePassword(password, true);
    if (passwordError) fieldErrors.password = passwordError;
    const phoneError = validateUserPhone(phone);
    if (phoneError) fieldErrors.phone = phoneError;

    if (Object.keys(fieldErrors).length > 0) {
        return { fieldErrors };
    }

    try {
        await requireServerActionAccessToken();

        const { isSuccess, error } = await createUserService({
            name,
            login_id,
            password,
            role,
            phone,
        });

        if (!isSuccess) {
            return {
                success: false,
                error: error?.message ?? "관리자 생성에 실패했습니다. 다시 시도해주세요.",
            };
        }

        revalidateTag("user");

        return { success: true };
    } catch (err) {
        captureServerException(err, "관리자 생성 중 오류", {
            action: "userCreateFormAction",
            login_id,
            role,
        });
        const message =
            err instanceof Error ? err.message : "관리자 생성 중 오류가 발생했습니다. 다시 시도해주세요.";
        return {
            success: false,
            error: message,
        };
    }
}

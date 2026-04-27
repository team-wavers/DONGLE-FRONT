"use server";

import { patchUserService } from "@dongle/service/user/user.service";
import { UpdateUserRequest } from "@dongle/types/user/user.d";
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

export interface UserEditActionState {
    success?: boolean;
    error?: string;
    fieldErrors?: UserFormFieldErrors;
}

export async function userEditFormAction(
    prevState: UserEditActionState,
    formData: FormData
): Promise<UserEditActionState> {
    const userId = formData.get("userId") as string;
    const name = (formData.get("name") as string) ?? "";
    const login_id = (formData.get("login_id") as string) ?? "";
    const password = (formData.get("password") as string) ?? "";
    const phone = (formData.get("phone") as string) ?? "";
    const originalName = formData.get("originalName") as string;
    const originalLoginId = formData.get("originalLoginId") as string;
    const originalPhone = formData.get("originalPhone") as string;

    if (!userId) {
        return {
            success: false,
            error: "사용자 정보를 찾을 수 없습니다.",
        };
    }

    const fieldErrors: UserFormFieldErrors = {};
    const nameError = validateUserName(name);
    if (nameError) fieldErrors.name = nameError;
    const loginIdError = validateLoginId(login_id);
    if (loginIdError) fieldErrors.login_id = loginIdError;
    const passwordError = validatePassword(password, false);
    if (passwordError) fieldErrors.password = passwordError;
    const phoneError = validateUserPhone(phone);
    if (phoneError) fieldErrors.phone = phoneError;

    if (Object.keys(fieldErrors).length > 0) {
        return {
            fieldErrors,
        };
    }

    try {
        await requireServerActionAccessToken();

        // 변경된 필드만 포함하는 업데이트 데이터 구성
        const updateData: UpdateUserRequest = {};

        // 이름이 변경된 경우만 추가
        if (name !== originalName) {
            updateData.name = name;
        }

        // 로그인 ID가 변경된 경우만 추가
        if (login_id !== originalLoginId) {
            updateData.login_id = login_id;
        }

        // 전화번호가 변경된 경우만 추가
        if (phone !== originalPhone) {
            updateData.phone = phone;
        }

        // 비밀번호가 입력된 경우에만 추가
        if (password && password.trim() !== "") {
            updateData.password = password;
        }

        // 변경된 값이 없으면 에러 반환
        if (Object.keys(updateData).length === 0) {
            return {
                success: false,
                error: "변경된 정보가 없습니다.",
            };
        }

        const { isSuccess, error: serviceError } = await patchUserService(Number(userId), updateData);

        if (!isSuccess) {
            return {
                success: false,
                error: serviceError?.message ?? "사용자 정보 수정에 실패했습니다. 다시 시도해주세요.",
            };
        }

        // 사용자 정보 캐시 초기화
        revalidateTag("user");
        revalidateTag(`user-${userId}`);

        return {
            success: true,
        };
    } catch (error) {
        captureServerException(error, "사용자 정보 수정 중 오류 발생", {
            action: "userEditFormAction",
            userId,
        });
        const message =
            error instanceof Error ? error.message : "사용자 정보 수정에 실패했습니다. 다시 시도해주세요.";
        return {
            success: false,
            error: message,
        };
    }
}

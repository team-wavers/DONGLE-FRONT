"use server";

import { createUserService, patchUserService } from "@dongle/service/user/user.service";
import { revalidateTag } from "next/cache";
import { actionFailure, actionSuccess, getZodFieldErrors, type ActionResult } from "@/shared/action";
import { requireServerActionAccessToken } from "@/shared/action/server-action-auth";
import { captureServerException } from "@/lib/sentry/capture-server-exception";
import {
    buildUserEditPayload,
    userCreateSchema,
    userEditSchema,
    type UserCreateField,
    type UserCreateFormValues,
    type UserEditField,
    type UserEditFormValues,
} from "./user-form.schema";

export type UserCreateActionResult = ActionResult<UserCreateField>;
export type UserEditActionResult = ActionResult<UserEditField>;

function getActionErrorMessage(error: unknown, fallback: string): string {
    return error instanceof Error && error.message ? error.message : fallback;
}

export async function submitUserCreateAction(values: UserCreateFormValues): Promise<UserCreateActionResult> {
    const parsed = userCreateSchema.safeParse(values);

    if (!parsed.success) {
        return actionFailure({
            fieldErrors: getZodFieldErrors<UserCreateField>(parsed.error),
            formError: "관리자 정보를 다시 확인해주세요.",
        });
    }

    try {
        await requireServerActionAccessToken();

        const { isSuccess, error } = await createUserService({
            name: parsed.data.name,
            login_id: parsed.data.login_id,
            password: parsed.data.password,
            role: "admin",
            phone: parsed.data.phone,
        });

        if (!isSuccess) {
            return actionFailure({
                formError: error?.message ?? "관리자 생성에 실패했습니다. 다시 시도해주세요.",
            });
        }

        revalidateTag("user");

        return actionSuccess({
            message: "관리자가 성공적으로 생성되었습니다.",
        });
    } catch (error) {
        captureServerException(error, "관리자 생성 중 오류", {
            action: "submitUserCreateAction",
            login_id: values.login_id,
            role: "admin",
        });

        return actionFailure({
            formError: getActionErrorMessage(error, "관리자 생성 중 오류가 발생했습니다. 다시 시도해주세요."),
        });
    }
}

export async function submitUserEditAction({
    userId,
    values,
    originalValues,
}: {
    userId: number;
    values: UserEditFormValues;
    originalValues: UserEditFormValues;
}): Promise<UserEditActionResult> {
    if (!Number.isFinite(userId)) {
        return actionFailure({
            formError: "사용자 정보를 찾을 수 없습니다.",
        });
    }

    const parsed = userEditSchema.safeParse(values);

    if (!parsed.success) {
        return actionFailure({
            fieldErrors: getZodFieldErrors<UserEditField>(parsed.error),
            formError: "사용자 정보를 다시 확인해주세요.",
        });
    }

    const updateData = buildUserEditPayload(parsed.data, originalValues);

    if (Object.keys(updateData).length === 0) {
        return actionFailure({
            formError: "변경된 정보가 없습니다.",
        });
    }

    try {
        await requireServerActionAccessToken();

        const { isSuccess, error } = await patchUserService(userId, updateData);

        if (!isSuccess) {
            return actionFailure({
                formError: error?.message ?? "사용자 정보 수정에 실패했습니다. 다시 시도해주세요.",
            });
        }

        revalidateTag("user");
        revalidateTag(`user-${userId}`);

        return actionSuccess({
            message: "사용자 정보가 성공적으로 수정되었습니다.",
        });
    } catch (error) {
        captureServerException(error, "사용자 정보 수정 중 오류 발생", {
            action: "submitUserEditAction",
            userId,
        });

        return actionFailure({
            formError: getActionErrorMessage(error, "사용자 정보 수정에 실패했습니다. 다시 시도해주세요."),
        });
    }
}

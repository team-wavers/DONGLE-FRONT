"use server";

import { patchUserService, getUserService } from "@dongle/service/user/user.service";
import { userTagGroups } from "@dongle/service";
import { UpdateUserRequest } from "@dongle/types/user/user.d";
import { decodeJwtToken, getTokenExpiresIn } from "@dongle/api/utils/jwt.util";
import { ACCESS_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME } from "@dongle/api/utils/cookie/cookie.contant";
import { getCookieOptions } from "@dongle/api/utils/cookie/cookie.options";
import { cookies } from "next/headers";
import { revalidateTags } from "@/lib/server/revalidate-tags";
import { loginService } from "@dongle/service/auth/auth.service";
import { captureServerException } from "@/lib/sentry/capture-server-exception";
import { getServiceErrorMessage, getSessionExpiredActionFailure, requireServerActionAccessToken } from "@/shared/action";

export interface ChangeAccountActionState {
    fieldErrors?: {
        currentPassword?: string;
        newId?: string;
        newPassword?: string;
        confirmPassword?: string;
    };
    success?: boolean;
    error?: string;
    sessionExpired?: boolean;
}

export async function changeAccountFormAction(
    prevState: ChangeAccountActionState,
    formData: FormData
): Promise<ChangeAccountActionState> {
    const currentPassword = formData.get("currentPassword") as string;
    const newId = formData.get("newId") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // 클라이언트 사이드 검증
    const fieldErrors: {
        currentPassword?: string;
        newId?: string;
        newPassword?: string;
        confirmPassword?: string;
    } = {};

    // 현재 비밀번호 확인 (필수)
    if (!currentPassword) {
        fieldErrors.currentPassword = "현재 비밀번호를 입력해주세요";
    }

    // 비밀번호 변경 시 확인
    if (newPassword || confirmPassword) {
        if (!newPassword) {
            fieldErrors.newPassword = "새 비밀번호를 입력해주세요";
        }
        if (!confirmPassword) {
            fieldErrors.confirmPassword = "비밀번호 확인을 입력해주세요";
        } else if (newPassword && newPassword !== confirmPassword) {
            fieldErrors.confirmPassword = "비밀번호가 일치하지 않습니다";
        }
    }

    if (Object.keys(fieldErrors).length > 0) {
        return {
            fieldErrors,
        };
    }

    try {
        // 쿠키에서 사용자 ID 추출
        const { claims } = await requireServerActionAccessToken();
        const userId = claims.user_id ?? claims.sub;
        if (!userId) {
            return {
                success: false,
                error: "사용자 정보를 가져올 수 없습니다.",
            };
        }

        // 현재 사용자 정보 가져오기
        const userResponse = await getUserService(Number(userId));
        if (!userResponse.isSuccess || !userResponse.result) {
            const expired = getSessionExpiredActionFailure(userResponse.error);
            if (expired) return { success: false, error: expired.formError, sessionExpired: true };
            return {
                success: false,
                error: "사용자 정보를 가져올 수 없습니다.",
            };
        }
        const currentUser = userResponse.result;

        // 현재 비밀번호 검증
        const loginResult = await loginService({
            login_id: currentUser.login_id,
            password: currentPassword,
        });

        if (!loginResult.isSuccess) {
            const expired = getSessionExpiredActionFailure(loginResult.error);
            if (expired) return { success: false, error: expired.formError, sessionExpired: true };
            return {
                success: false,
                error: "현재 비밀번호가 일치하지 않습니다.",
            };
        }

        const cookieStore = await cookies();
        const accessPayload = decodeJwtToken(loginResult.result.accessToken);
        const refreshPayload = decodeJwtToken(loginResult.result.refreshToken);
        cookieStore.set(ACCESS_TOKEN_COOKIE_NAME, loginResult.result.accessToken, {
            ...getCookieOptions({ maxAge: getTokenExpiresIn(accessPayload, 900), httpOnly: true }),
        });
        cookieStore.set(REFRESH_TOKEN_COOKIE_NAME, loginResult.result.refreshToken, {
            ...getCookieOptions({ maxAge: getTokenExpiresIn(refreshPayload, 7 * 24 * 3600), httpOnly: true }),
        });

        // 업데이트할 데이터 구성
        const updateData: UpdateUserRequest = {};

        // 아이디가 입력된 경우에만 추가
        if (newId && newId.trim()) {
            updateData.login_id = newId.trim();
        }

        // 비밀번호가 입력된 경우에만 추가
        if (newPassword && newPassword.trim()) {
            updateData.password = newPassword.trim();
        }

        // 빈 업데이트 데이터 체크
        if (Object.keys(updateData).length === 0) {
            return {
                success: false,
                error: "변경할 아이디 또는 비밀번호를 입력해주세요.",
            };
        }

        const updateResult = await patchUserService(Number(userId), updateData);

        if (!updateResult.isSuccess) {
            const expired = getSessionExpiredActionFailure(updateResult.error);
            if (expired) return { success: false, error: expired.formError, sessionExpired: true };
            return {
                success: false,
                error: getServiceErrorMessage(updateResult.error, "계정 정보 변경에 실패했습니다. 다시 시도해주세요."),
            };
        }

        // 사용자 정보 캐시 초기화
        revalidateTags(userTagGroups.detail(userId));

        return {
            success: true,
        };
    } catch (error) {
        const expired = getSessionExpiredActionFailure(error);
        if (expired) return { success: false, error: expired.formError, sessionExpired: true };
        captureServerException(error, "계정 정보 변경 중 오류", {
            action: "changeAccountFormAction",
        });
        return {
            success: false,
            error: "계정 정보 변경에 실패했습니다. 다시 시도해주세요.",
        };
    }
}

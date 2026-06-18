"use server";

import { loginService } from "@dongle/service/auth/auth.service";
import { LoginActionState } from "@dongle/types/auth/auth";
import type { AuthRole } from "@dongle/types/auth/auth-role";
import { getCookieOptions } from "@dongle/api/utils/cookie/cookie.options";
import { getTokenExpiresIn, decodeJwtToken } from "@dongle/api/utils/jwt.util";
import { ACCESS_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME } from "@dongle/api/utils/cookie/cookie.contant";

import { cookies } from "next/headers";
import { captureServerException } from "@/lib/sentry/capture-server-exception";
import { mapLoginActionError, normalizeUsernameInput, preservePasswordInput, toFieldErrorState, validateLoginFields } from "@/feature/auth/utils/login-form-policy";

// 서버 액션 (실제로는 별도 파일에 있을 수 있음)
export async function loginFormAction(prevState: LoginActionState, formData: FormData): Promise<LoginActionState> {
    const username = normalizeUsernameInput(formData.get("username"));
    const password = preservePasswordInput(formData.get("password"));

    const fieldErrors = validateLoginFields(username, password);

    if (Object.keys(fieldErrors).length > 0) {
        return toFieldErrorState(fieldErrors);
    }

    // 로그인 처리

    try {
        const response = await loginService({
            login_id: username,
            password,
        });

        if (!response.isSuccess) {
            return {
                success: false,
                error: response.error?.detail || "로그인에 실패했습니다.",
            };
        }
        // JWT 토큰 파싱 (club_id, role 추출용)
        const accessTokenPayload = decodeJwtToken(response.result.accessToken);
        const refreshTokenPayload = decodeJwtToken(response.result.refreshToken);

        if (!accessTokenPayload || !refreshTokenPayload) {
            return {
                success: false,
                error: "로그인에 실패했습니다.",
            };
        }

        const cookieStore = await cookies();

        // JWT 토큰의 exp를 사용하여 정확한 만료 시간 계산 (초 단위)
        const accessTokenExpiresIn = getTokenExpiresIn(accessTokenPayload, 900); // 기본값 15분
        const refreshTokenExpiresIn = getTokenExpiresIn(refreshTokenPayload, 7 * 24 * 3600); // 기본값 7일

        cookieStore.set(ACCESS_TOKEN_COOKIE_NAME, response.result.accessToken, {
            ...getCookieOptions({ maxAge: accessTokenExpiresIn, httpOnly: true }),
        });

        cookieStore.set(REFRESH_TOKEN_COOKIE_NAME, response.result.refreshToken, {
            ...getCookieOptions({ maxAge: refreshTokenExpiresIn, httpOnly: true }),
        });

        return {
            success: true,
            clubId: accessTokenPayload?.club_id?.toString(),
            role: accessTokenPayload?.role as AuthRole | undefined,
        };
    } catch (error) {
        captureServerException(error, "로그인 처리 중 오류", {
            action: "loginFormAction",
        });
        return mapLoginActionError(error);
    }
}

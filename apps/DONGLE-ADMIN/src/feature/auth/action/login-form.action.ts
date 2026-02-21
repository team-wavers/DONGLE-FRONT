"use server";

import { loginService } from "@dongle/service/auth/auth.service";
import { LoginActionState } from "@dongle/types/auth/auth";
import { getCookieOptions } from "@dongle/api/utils/cookie/cookie.options";
import { getTokenExpiresIn, decodeJwtToken } from "@dongle/api/utils/jwt.util";

import { cookies } from "next/headers";

// 서버 액션 (실제로는 별도 파일에 있을 수 있음)
export async function loginFormAction(prevState: LoginActionState, formData: FormData): Promise<LoginActionState> {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    // 클라이언트 사이드 검증
    const fieldErrors: { username?: string; password?: string } = {};
    if (!username) fieldErrors.username = "아이디를 입력해주세요";
    if (!password) fieldErrors.password = "비밀번호를 입력해주세요";

    if (Object.keys(fieldErrors).length > 0) {
        return {
            fieldErrors,
        };
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

        cookieStore.set("accessToken", response.result.accessToken, {
            ...getCookieOptions({ maxAge: accessTokenExpiresIn, httpOnly: true }),
        });

        cookieStore.set("refreshToken", response.result.refreshToken, {
            ...getCookieOptions({ maxAge: refreshTokenExpiresIn, httpOnly: true }),
        });

        return {
            success: true,
            clubId: accessTokenPayload?.club_id?.toString(),
            role: accessTokenPayload?.role as "admin" | "club" | undefined,
        };
    } catch (error) {
        if (error instanceof Error) {
            return {
                success: false,
                error: error.message,
            };
        }
        return {
            success: false,
            error: "로그인 처리 중 오류가 발생했습니다.",
        };
    }
}

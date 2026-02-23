import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { refreshTokenService } from "@dongle/service/auth/auth.service";
import { getCookieOptions } from "@dongle/api/utils/cookie/cookie.options";
import { getTokenExpiresIn, decodeJwtToken } from "@dongle/api/utils/jwt.util";

export async function handleTokenRefresh(request: NextRequest, refreshToken: string): Promise<NextResponse> {
    try {
        const refreshTokenResponse = await refreshTokenService({
            refreshToken,
        });

        if (refreshTokenResponse.isSuccess) {
            // JWT 토큰 파싱 (만료 시간 및 사용자 정보 추출용)
            const accessTokenPayload = decodeJwtToken(refreshTokenResponse.result.accessToken);
            const refreshTokenPayload = refreshTokenResponse.result.refreshToken
                ? decodeJwtToken(refreshTokenResponse.result.refreshToken)
                : null;

            // JWT 토큰의 exp를 사용하여 정확한 만료 시간 계산 (초 단위)
            const accessTokenExpiresIn = getTokenExpiresIn(accessTokenPayload, 900); // 기본값 15분
            const refreshTokenExpiresIn = getTokenExpiresIn(refreshTokenPayload, 7 * 24 * 3600); // 기본값 7일

            // 토큰 리프레시 성공 - 새 토큰 설정
            const response = NextResponse.next();
            response.cookies.set("accessToken", refreshTokenResponse.result.accessToken, {
                ...getCookieOptions({ maxAge: accessTokenExpiresIn, httpOnly: true }),
            });

            if (refreshTokenResponse.result.refreshToken) {
                response.cookies.set("refreshToken", refreshTokenResponse.result.refreshToken, {
                    ...getCookieOptions({ maxAge: refreshTokenExpiresIn, httpOnly: true }),
                });
            }

            // club_id와 role은 쿠키에 저장하지 않고 accessToken에서 매번 파싱

            return response;
        } else {
            // 토큰 리프레시 실패 - 토큰 삭제 후 로그인 페이지로 리다이렉트
            return handleTokenRefreshFailure(request);
        }
    } catch (error) {
        console.error("Token refresh error:", error);
        // 에러 발생 시에도 토큰 삭제 후 로그인 페이지로 리다이렉트
        return handleTokenRefreshFailure(request);
    }
}

function handleTokenRefreshFailure(request: NextRequest): NextResponse {
    const response = NextResponse.redirect(new URL("/login?expired=true", request.url));

    // 모든 토큰 쿠키 삭제
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
    return response;
}

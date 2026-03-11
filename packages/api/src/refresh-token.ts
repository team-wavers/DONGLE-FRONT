import Cookies from "js-cookie";
import { ACCESS_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME } from "./utils/cookie/cookie.contant";
import { getCookieOptions, getCookieSecureOption } from "./utils/cookie/cookie.options";
import { getRefreshTokenFromClientCookie } from "./utils/cookie/client-cookie.util";
import { getRefreshTokenFromServerCookie } from "./utils/cookie/server-cookie.util";
import { setAccessTokenToServerCookie, setRefreshTokenToServerCookie } from "./utils/cookie/server-cookie.util";
import { getTokenExpiresIn, decodeJwtToken } from "./utils/jwt.util";

interface RefreshTokenParams {
    baseUrl: string;
}

export interface RefreshTokenResult {
    success: boolean;
    accessToken?: string;
}

export async function refreshToken({ baseUrl }: RefreshTokenParams): Promise<RefreshTokenResult> {
    try {
        const isClient = typeof window !== "undefined";
        const token =
            isClient ? getRefreshTokenFromClientCookie() : await getRefreshTokenFromServerCookie();
        if (!token) {
            return { success: false };
        }

        const response = await fetch(`${baseUrl}/auth/refresh`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ refreshToken: token }),
            credentials: "include",
        });

        if (!response.ok) {
            return { success: false };
        }

        const data = await response.json();

        if (data.isSuccess && data.result) {
            // JWT 토큰 파싱 (만료 시간 추출용)
            const accessTokenPayload = decodeJwtToken(data.result.accessToken);
            const refreshTokenPayload = data.result.refreshToken ? decodeJwtToken(data.result.refreshToken) : null;

            // JWT 토큰의 exp를 사용하여 정확한 만료 시간 계산 (초 단위)
            const accessTokenExpiresIn = getTokenExpiresIn(accessTokenPayload, 900); // 기본값 15분
            const refreshTokenExpiresIn = getTokenExpiresIn(refreshTokenPayload, 7 * 24 * 3600); // 기본값 7일

            if (isClient) {
                Cookies.set(ACCESS_TOKEN_COOKIE_NAME, data.result.accessToken, {
                    path: "/",
                    maxAge: accessTokenExpiresIn, // 초 단위
                    secure: getCookieSecureOption(),
                    sameSite: "lax",
                });

                if (data.result.refreshToken) {
                    Cookies.set(REFRESH_TOKEN_COOKIE_NAME, data.result.refreshToken, {
                        path: "/",
                        maxAge: refreshTokenExpiresIn, // 초 단위
                        secure: getCookieSecureOption(),
                        sameSite: "lax",
                    });
                }
            } else {
                await setAccessTokenToServerCookie(
                    data.result.accessToken,
                    getCookieOptions({ maxAge: accessTokenExpiresIn, httpOnly: true })
                );

                if (data.result.refreshToken) {
                    await setRefreshTokenToServerCookie(
                        data.result.refreshToken,
                        getCookieOptions({ maxAge: refreshTokenExpiresIn, httpOnly: true })
                    );
                }
            }

            return {
                success: true,
                accessToken: data.result.accessToken,
            };
        }

        return { success: false };
    } catch (error) {
        console.error("토큰 갱신 실패:", error);
        return { success: false };
    }
}

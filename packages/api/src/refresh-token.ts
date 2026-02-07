import Cookies from "js-cookie";
import { ACCESS_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME } from "./utils/cookie/cookie.contant";
import { getRefreshTokenFromClientCookie } from "./utils/cookie/client-cookie.util";
import { getRefreshTokenFromServerCookie } from "./utils/cookie/server-cookie.util";
import { getCookieSecureOption } from "./utils/cookie/cookie.options";
import { getTokenExpiresIn, decodeJwtToken } from "./utils/jwt.util";

interface RefreshTokenParams {
    baseUrl: string;
}

export async function refreshToken({ baseUrl }: RefreshTokenParams): Promise<boolean> {
    try {
        const token =
            typeof window !== "undefined"
                ? getRefreshTokenFromClientCookie()
                : await getRefreshTokenFromServerCookie();
        if (!token) {
            return false;
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
            return false;
        }

        const data = await response.json();

        if (data.isSuccess && data.result) {
            // JWT 토큰 파싱 (만료 시간 추출용)
            const accessTokenPayload = decodeJwtToken(data.result.accessToken);
            const refreshTokenPayload = data.result.refreshToken ? decodeJwtToken(data.result.refreshToken) : null;

            // JWT 토큰의 exp를 사용하여 정확한 만료 시간 계산 (초 단위)
            const accessTokenExpiresIn = getTokenExpiresIn(accessTokenPayload, 900); // 기본값 15분
            const refreshTokenExpiresIn = getTokenExpiresIn(refreshTokenPayload, 7 * 24 * 3600); // 기본값 7일

            // js-cookie는 expires를 일 단위로 받지만, maxAge를 초 단위로도 받을 수 있음
            // 더 정확한 만료 시간을 위해 maxAge 사용 (초 단위)
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

            return true;
        }

        return false;
    } catch (error) {
        console.error("토큰 갱신 실패:", error);
        return false;
    }
}

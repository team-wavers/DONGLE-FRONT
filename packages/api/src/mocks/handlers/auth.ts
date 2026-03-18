import { decodeJwt, JWTPayload } from "jose";
import { http, HttpResponse } from "msw";
import { AUTH_ROLE } from "@dongle/types/auth/auth-role";

// JWT 토큰 생성을 위한 간단한 함수
function generateMockJWT(payload: JWTPayload): string {
    // Node.js 환경에서는 Buffer를 사용하여 base64 인코딩
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64");
    const payloadEncoded = Buffer.from(JSON.stringify(payload)).toString("base64");
    const signature = Buffer.from("mock-signature").toString("base64");

    return `${header}.${payloadEncoded}.${signature}`;
}

const authHandlers = [
    // 로그인
    http.post(`/auth/login`, async ({ request }) => {
        const { login_id, password } = (await request.json()) as {
            login_id: string;
            password: string;
        };

        void password;

        // 간단한 인증 로직 (실제로는 서버에서 처리)
        if (login_id === "admin") {
            const now = Math.floor(Date.now() / 1000);
            const adminPayload = {
                sub: "admin_user",
                user_id: 1,
                role: AUTH_ROLE.ADMIN,
                exp: now + 3600, // 1시간 후 만료
                iat: now,
                username: "admin",
            };

            const accessToken = generateMockJWT(adminPayload);

            // 리프레시 토큰은 더 긴 만료 시간 (7일)
            const refreshPayload = {
                sub: "admin_user",
                user_id: 1,
                role: AUTH_ROLE.ADMIN,
                exp: now + 7 * 24 * 3600, // 7일 후 만료
                iat: now,
                username: "admin",
                token_type: "refresh",
            };

            const refreshToken = generateMockJWT(refreshPayload);

            return HttpResponse.json({
                isSuccess: true,
                result: {
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                    tokenType: "Bearer",
                    expiresIn: 3600 * 1000, // 밀리초 단위 (1시간 = 3600000ms)
                    role: AUTH_ROLE.ADMIN,
                },
            });
        }

        const now = Math.floor(Date.now() / 1000);
        const clubPayload = {
            sub: "club_user",
            user_id: 2,
            role: AUTH_ROLE.PRESIDENT,
            exp: now + 3600, // 1시간 후 만료
            iat: now,
            username: login_id,
            club_id: 1,
        };

        const accessToken = generateMockJWT(clubPayload);

        // 리프레시 토큰은 더 긴 만료 시간 (7일)
        const refreshPayload = {
            sub: "club_user",
            user_id: 2,
            role: AUTH_ROLE.PRESIDENT,
            exp: now + 7 * 24 * 3600, // 7일 후 만료
            iat: now,
            username: login_id,
            club_id: 1,
            token_type: "refresh",
        };

        const refreshToken = generateMockJWT(refreshPayload);

        return HttpResponse.json({
            isSuccess: true,
            result: {
                accessToken: accessToken,
                refreshToken: refreshToken,
                tokenType: "Bearer",
                expiresIn: 3600 * 1000, // 밀리초 단위 (1시간 = 3600000ms)
                role: AUTH_ROLE.PRESIDENT,
                club_id: 1,
            },
        });
    }),

    // 토큰 갱신
    http.post(`/auth/refresh`, async ({ request }) => {
        const { refreshToken } = (await request.json()) as {
            refreshToken: string;
        };

        try {
            const payload = decodeJwt(refreshToken);

            // 토큰 만료 확인
            const now = Math.floor(Date.now() / 1000);
            if (payload.exp && payload.exp < now) {
                return HttpResponse.json(
                    {
                        isSuccess: false,
                        message: "Refresh token expired",
                    },
                    { status: 401 }
                );
            }

            // 새로운 액세스 토큰 생성
            const newAccessPayload = {
                sub: payload.sub,
                user_id: payload.user_id,
                role: payload.role,
                exp: now + 3600, // 1시간 후 만료
                iat: now,
                username: payload.username,
            };

            const newAccessToken = generateMockJWT(newAccessPayload);

            return HttpResponse.json({
                isSuccess: true,
                result: {
                    accessToken: newAccessToken,
                    tokenType: "Bearer",
                    expiresIn: 3600 * 1000, // 밀리초 단위 (1시간 = 3600000ms)
                    role: payload.role,
                },
            });
        } catch {
            return HttpResponse.json(
                {
                    isSuccess: false,
                    message: "Invalid refresh token format",
                },
                { status: 400 }
            );
        }
    }),

    // 로그아웃
    http.post(`/auth/logout`, () => {
        return HttpResponse.json({
            isSuccess: true,
            result: {
                message: "Logout successful",
            },
        });
    }),
];

export default authHandlers;

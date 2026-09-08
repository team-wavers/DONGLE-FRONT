import { NextRequest, NextResponse } from "next/server";
import { getCookieOptions } from "@dongle/api/utils/cookie/cookie.options";
import { captureServerException } from "@/lib/sentry/capture-server-exception";

export async function POST(request: NextRequest) {
    try {
        // 1. 쿠키에서 accessToken 읽기 (서버 사이드)
        const accessToken = request.cookies.get("accessToken")?.value;

        if (!accessToken) {
            return NextResponse.json(
                {
                    isSuccess: false,
                    error: {
                        message: "Unauthorized",
                        detail: "토큰이 없습니다.",
                    },
                },
                { status: 401 }
            );
        }

        // 2. 백엔드로 요청 전달 (Authorization 헤더 포함)
        const apiUrl = process.env.API_URL;
        if (!apiUrl) {
            return NextResponse.json(
                {
                    isSuccess: false,
                    error: {
                        message: "Internal Server Error",
                        detail: "API URL이 설정되지 않았습니다.",
                    },
                },
                { status: 500 }
            );
        }

        const issueRegistrationUrl = (token: string) => fetch(`${apiUrl}/clubs/registration-urls`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({}),
        });
        let response = await issueRegistrationUrl(accessToken);

        let refreshedTokens: { accessToken: string; refreshToken?: string } | undefined;
        if (response.status === 401) {
            const refreshToken = request.cookies.get("refreshToken")?.value;
            if (refreshToken) {
                const refreshResponse = await fetch(`${apiUrl}/auth/refresh`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ refreshToken }),
                    cache: "no-store",
                });
                const refreshData = await refreshResponse.json().catch(() => null) as
                    | { isSuccess?: boolean; result?: { accessToken?: string; refreshToken?: string } }
                    | null;
                if (refreshResponse.ok && refreshData?.isSuccess && refreshData.result?.accessToken) {
                    refreshedTokens = {
                        accessToken: refreshData.result.accessToken,
                        refreshToken: refreshData.result.refreshToken,
                    };
                    response = await issueRegistrationUrl(refreshedTokens.accessToken);
                }
            }
        }

        const data = await response.json().catch(() => ({
            isSuccess: false,
            error: { message: "Invalid Response", detail: "응답을 해석할 수 없습니다." },
        }));

        // 3. 백엔드 응답을 그대로 클라이언트에 전달
        const nextResponse = NextResponse.json(data, { status: response.status });
        if (refreshedTokens && response.ok) {
            nextResponse.cookies.set("accessToken", refreshedTokens.accessToken, getCookieOptions({ httpOnly: true }));
            if (refreshedTokens.refreshToken) {
                nextResponse.cookies.set("refreshToken", refreshedTokens.refreshToken, getCookieOptions({ httpOnly: true }));
            }
        }
        return nextResponse;
    } catch (error) {
        captureServerException(error, "동아리 등록 URL 생성 API Route 오류", {
            route: "/api/clubs/registration-urls",
            method: "POST",
        });
        return NextResponse.json(
            {
                isSuccess: false,
                error: {
                    message: "Internal Server Error",
                    detail: "URL 생성 중 오류가 발생했습니다.",
                },
            },
            { status: 500 }
        );
    }
}

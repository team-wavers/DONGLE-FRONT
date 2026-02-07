import { NextRequest, NextResponse } from "next/server";
import { getAccessTokenFromServerCookie } from "@dongle/api/utils/cookie/server-cookie.util";

export async function POST(request: NextRequest) {
    void request;
    try {
        // 1. 쿠키에서 accessToken 읽기 (서버 사이드)
        const accessToken = await getAccessTokenFromServerCookie();

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
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
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

        const response = await fetch(`${apiUrl}/clubs/registration-urls`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({}),
        });

        const data = await response.json();

        // 3. 백엔드 응답을 그대로 클라이언트에 전달
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("API Route 오류:", error);
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

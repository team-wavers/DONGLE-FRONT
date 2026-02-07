/**
 * 쿠키 옵션 유틸리티
 * 환경에 따라 secure 옵션을 자동으로 설정합니다.
 */

/**
 * 환경에 따른 secure 옵션 반환
 * - 개발 환경: false (HTTP에서도 쿠키 전송 가능)
 * - 프로덕션 환경: true (HTTPS에서만 쿠키 전송)
 */
export function getCookieSecureOption(): boolean {
    return process.env.NODE_ENV === "production";
}

/**
 * 기본 쿠키 옵션 반환
 * @param options 추가 옵션 (maxAge, httpOnly 등)
 */
export function getCookieOptions(options?: {
    maxAge?: number;
    httpOnly?: boolean;
    sameSite?: "strict" | "lax" | "none";
}): {
    path: string;
    secure: boolean;
    sameSite: "strict" | "lax" | "none";
    maxAge?: number;
    httpOnly?: boolean;
} {
    return {
        path: "/",
        secure: getCookieSecureOption(),
        sameSite: options?.sameSite || "lax",
        ...(options?.maxAge !== undefined && { maxAge: options.maxAge }),
        ...(options?.httpOnly !== undefined && { httpOnly: options.httpOnly }),
    };
}

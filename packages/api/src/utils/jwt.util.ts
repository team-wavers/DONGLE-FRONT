import { decodeJwt } from "jose";

interface JwtPayload {
    sub?: string | number;
    user_id?: string | number;
    id?: string | number;
    role?: "president" | "admin";
    exp?: number;
    iat?: number;
    [key: string]: unknown;
}

/**
 * JWT 토큰을 디코드하여 페이로드를 반환합니다.
 * @param token JWT 토큰 문자열
 * @returns 디코드된 페이로드 또는 null
 */
export function decodeJwtToken(token: string): JwtPayload | null {
    try {
        return decodeJwt(token);
    } catch (error) {
        console.error("JWT 토큰 디코딩 실패:", error);
        return null;
    }
}

export function getPresidentIdFromToken(token: string): string | null {
    const payload = decodeJwtToken(token);
    if (!payload) {
        return null;
    }
    return payload.sub as string;
}

/**
 * JWT 토큰에서 사용자 ID를 추출합니다.
 * @param token JWT 토큰 문자열
 * @returns 사용자 ID 또는 null
 */
export function getUserIdFromToken(token: string): number | null {
    const payload = decodeJwtToken(token);
    if (!payload) {
        return null;
    }

    // user_id가 있으면 우선 사용, 없으면 sub 사용 (JWT 표준)
    const userId = payload.user_id ?? payload.sub;

    if (typeof userId === "string") {
        return parseInt(userId, 10);
    }

    if (typeof userId === "number") {
        return userId;
    }

    return null;
}

/**
 * JWT 토큰에서 동아리 ID를 추출합니다.
 * @param token JWT 토큰 문자열
 * @returns 사용자 ID 또는 null
 */
export function getUserClubIdFromToken(token: string): number | null {
    const payload = decodeJwtToken(token);
    if (!payload) {
        return null;
    }

    const clubId = payload.club_id;

    if (typeof clubId === "string") {
        return parseInt(clubId, 10);
    }

    if (typeof clubId === "number") {
        return clubId;
    }

    return null;
}

/**
 * JWT 토큰에서 사용자 역할을 추출합니다.
 * @param token JWT 토큰 문자열
 * @returns 사용자 역할 또는 null
 */
export function getUserRoleFromToken(token: string): string | null {
    const payload = decodeJwtToken(token);
    if (!payload) {
        return null;
    }

    return payload.role || null;
}

/**
 * JWT 토큰이 만료되었는지 확인합니다.
 * @param token JWT 토큰 문자열
 * @returns 만료 여부
 */
export function isTokenExpired(token: string): boolean {
    const payload = decodeJwtToken(token);
    if (!payload || !payload.exp) {
        return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
}

/**
 * JWT 토큰의 만료 시간을 가져옵니다.
 * @param token JWT 토큰 문자열
 * @returns 만료 시간 (Date 객체) 또는 null
 */
export function getTokenExpirationTime(token: string): Date | null {
    const payload = decodeJwtToken(token);
    if (!payload || !payload.exp) {
        return null;
    }

    return new Date(payload.exp * 1000);
}

/**
 * JWT 토큰의 발급 시간을 가져옵니다.
 * @param token JWT 토큰 문자열
 * @returns 발급 시간 (Date 객체) 또는 null
 */
export function getTokenIssuedAtTime(token: string): Date | null {
    const payload = decodeJwtToken(token);
    if (!payload || !payload.iat) {
        return null;
    }

    return new Date(payload.iat * 1000);
}

/**
 * JWT 페이로드의 exp를 사용하여 만료까지 남은 시간을 계산합니다 (초 단위)
 * @param payload JWT 페이로드 객체 (exp 속성 포함)
 * @param defaultSeconds exp가 없을 때 사용할 기본값 (초 단위)
 * @returns 만료까지 남은 시간 (초 단위)
 */
export function getTokenExpiresIn(payload: JwtPayload | null, defaultSeconds: number): number {
    if (!payload || !payload.exp) {
        return defaultSeconds;
    }

    const now = Math.floor(Date.now() / 1000);
    const expiresIn = payload.exp - now;

    // 만료 시간이 이미 지났거나 음수인 경우 기본값 반환
    return expiresIn > 0 ? expiresIn : defaultSeconds;
}

import type { FetchOptions } from "./fetch-types";
import { getAccessTokenFromServerCookie } from "./utils/cookie/server-cookie.util";

interface MakeRequestParams {
    url: string;
    method: string;
    data?: unknown;
    options?: FetchOptions;
    baseUrl: string;
    refreshToken: () => Promise<{ success: boolean; accessToken?: string }>;
    accessTokenOverride?: string;
}

export async function makeRequest({
    url,
    method,
    data,
    options,
    baseUrl,
    refreshToken,
    accessTokenOverride,
}: MakeRequestParams): Promise<Response> {
    const isClient = typeof window !== "undefined";

    // 서버 컴포넌트/서버 액션일 때만 accessToken 가져오기
    const accessToken = accessTokenOverride ?? (!isClient ? await getAccessTokenFromServerCookie() : undefined);

    // FormData인 경우 JSON.stringify 하지 않음
    const isFormData = data instanceof FormData;
    const body = data !== undefined ? (isFormData ? data : JSON.stringify(data)) : undefined;

    // 헤더 설정
    const defaultHeaders: HeadersInit = {};

    // 서버에서만 Authorization 헤더 설정
    if (accessToken) {
        defaultHeaders.Authorization = `Bearer ${accessToken}`;
    }

    // FormData가 아니고 body가 있는 경우 Content-Type 설정
    // FormData인 경우 Content-Type을 설정하지 않음 (브라우저가 자동으로 boundary 포함)
    if (!isFormData && body !== undefined) {
        defaultHeaders["Content-Type"] = "application/json";
    }

    const headers: HeadersInit = {
        ...defaultHeaders,
        ...(options?.headers && options.headers),
    };

    // 클라이언트에서는 credentials 사용, 서버에서는 사용하지 않음
    const fetchOptions: FetchOptions = {
        method,
        ...(body !== undefined && { body }),
        headers,
        ...options,
        ...(isClient && { credentials: "include" as RequestCredentials }),
    };

    const response = await fetch(`${baseUrl}${url}`, fetchOptions);
    // 401 에러 시 토큰 갱신 시도 (클라이언트에서만)
    if (response.status === 401) {
        const refreshResult = await refreshToken();
        if (refreshResult.success) {
            // 토큰 갱신 성공 시 원래 요청 재시도
            return makeRequest({
                url,
                method,
                data,
                options,
                baseUrl,
                refreshToken,
                accessTokenOverride: refreshResult.accessToken,
            });
        }
    }

    if (!response.ok) {
        console.error("HTTP error:", response);
    }
    return response;
}

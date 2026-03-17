interface HandleErrorResponseParams {
    response: Response;
    requestPayload?: unknown;
    url?: string;
    method?: string;
}

function extractErrorMessage(errorData: unknown, response: Response): string {
    if (response.status === 401) {
        return "권한이 없거나 로그인 세션이 만료되었습니다.";
    }

    if (!errorData || typeof errorData !== "object") {
        return `HTTP ${response.status}: ${response.statusText}`;
    }

    const payload = errorData as {
        message?: unknown;
        detail?: unknown;
        error?: {
            message?: unknown;
            detail?: unknown;
        };
    };

    const candidates = [
        payload.error?.detail,
        payload.error?.message,
        payload.detail,
        payload.message,
    ];

    for (const candidate of candidates) {
        if (typeof candidate === "string" && candidate.trim()) {
            return candidate;
        }
    }

    return `HTTP ${response.status}: ${response.statusText}`;
}

export async function handleErrorResponse({
    response,
    requestPayload,
    url,
    method,
}: HandleErrorResponseParams): Promise<never> {
    try {
        const errorData = await response.json();
        const message = extractErrorMessage(errorData, response);
        
        // 에러 페이로드 로깅
        console.error(`[${method || "UNKNOWN"}] ${url || response.url} - ${response.status}:`, {
            request: requestPayload,
            error: message,
        });
        
        throw new Error(message);
    } catch (error) {
        // JSON 파싱 실패 시 원본 에러를 throw
        if (error instanceof Error && error.message.includes("JSON")) {
            console.error(`[${method || "UNKNOWN"}] ${url || response.url} - ${response.status} (JSON 파싱 실패):`, {
                request: requestPayload,
            });
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        throw error;
    }
}

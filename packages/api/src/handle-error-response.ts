interface HandleErrorResponseParams {
    response: Response;
    requestPayload?: unknown;
    url?: string;
    method?: string;
}

export interface SyntheticErrorResponseParams {
    response: Response;
    requestPayload?: unknown;
    url?: string;
    method?: string;
    parseError?: unknown;
}

function summarizeRequestPayload(requestPayload: unknown) {
    if (requestPayload instanceof FormData) {
        return {
            type: "FormData",
            keys: Array.from(requestPayload.keys()),
        };
    }

    if (Array.isArray(requestPayload)) {
        return {
            type: "array",
            length: requestPayload.length,
        };
    }

    if (requestPayload && typeof requestPayload === "object") {
        return {
            type: "object",
            keys: Object.keys(requestPayload as Record<string, unknown>),
        };
    }

    return requestPayload;
}

function extractErrorMessage(errorData: unknown, response: Response): string {
    if (!errorData || typeof errorData !== "object") {
        if (response.status === 401) {
            return "권한이 없거나 로그인 세션이 만료되었습니다.";
        }

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

    const candidates = [payload.error?.detail, payload.error?.message, payload.detail, payload.message];

    for (const candidate of candidates) {
        if (typeof candidate === "string" && candidate.trim()) {
            return candidate;
        }
    }

    if (response.status === 401) {
        return "권한이 없거나 로그인 세션이 만료되었습니다.";
    }

    return `HTTP ${response.status}: ${response.statusText}`;
}

export function createSyntheticErrorResponse({
    response,
    requestPayload,
    url,
    method,
    parseError,
}: SyntheticErrorResponseParams) {
    const requestSummary = summarizeRequestPayload(requestPayload);
    const targetUrl = url || response.url || "unknown_url";
    const safeMethod = method || "UNKNOWN";

    const parseErrorMessage =
        parseError instanceof Error && parseError.message.trim() ? parseError.message : String(parseError ?? "unknown");

    console.error(`[${safeMethod}] ${targetUrl} - ${response.status} (JSON 파싱 실패):`, {
        request: requestSummary,
        parseError: parseErrorMessage,
    });

    return {
        isSuccess: false as const,
        error: {
            message: `HTTP ${response.status}: ${response.statusText}`,
            detail: `${response.statusText || "Unknown Error"} (url: ${targetUrl}, method: ${safeMethod})`,
        },
    };
}

export async function handleErrorResponse({
    response,
    requestPayload,
    url,
    method,
}: HandleErrorResponseParams): Promise<never> {
    const requestSummary = summarizeRequestPayload(requestPayload);

    try {
        const errorData = await response.json();
        const message = extractErrorMessage(errorData, response);

        console.error(`[${method || "UNKNOWN"}] ${url || response.url} - ${response.status}:`, {
            request: requestSummary,
            error: message,
        });

        throw new Error(message);
    } catch (error) {
        if (error instanceof Error && error.message.includes("JSON")) {
            // 기존 계약: 여전히 throw하지만, parse 실패 로그/합성 응답 생성은 공용 helper로 위임한다.
            createSyntheticErrorResponse({ response, requestPayload, url, method, parseError: error });
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        throw error;
    }
}

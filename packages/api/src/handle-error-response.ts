export interface SyntheticErrorResponseParams {
    response: Response;
    requestPayload?: unknown;
    url?: string;
    method?: string;
    parseError?: unknown;
}

const SENSITIVE_REQUEST_KEY = /password|passcode|token|authorization|login_?id|username|phone|secret/i;

export function summarizeRequestPayload(requestPayload: unknown) {
    if (requestPayload instanceof FormData) {
        return {
            type: "FormData",
            keys: Array.from(requestPayload.keys()).filter((key) => !SENSITIVE_REQUEST_KEY.test(key)),
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
            keys: Object.keys(requestPayload as Record<string, unknown>).filter(
                (key) => !SENSITIVE_REQUEST_KEY.test(key)
            ),
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
            status: response.status,
        },
    };
}

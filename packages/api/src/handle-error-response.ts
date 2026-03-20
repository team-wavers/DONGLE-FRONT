interface HandleErrorResponseParams {
    response: Response;
    requestPayload?: unknown;
    url?: string;
    method?: string;
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
    const fallback401Message = "권한이 없거나 로그인 세션이 만료되었습니다.";

    if (errorData && typeof errorData === "object") {
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
    }

    if (response.status === 401) {
        return fallback401Message;
    }

    if (!errorData || typeof errorData !== "object") {
        return `HTTP ${response.status}: ${response.statusText}`;
    }

    return `HTTP ${response.status}: ${response.statusText}`;
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
            console.error(`[${method || "UNKNOWN"}] ${url || response.url} - ${response.status} (JSON 파싱 실패):`, {
                request: requestSummary,
            });
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        throw error;
    }
}

interface HandleErrorResponseParams {
    response: Response;
    requestPayload?: unknown;
    url?: string;
    method?: string;
}

export async function handleErrorResponse({
    response,
    requestPayload,
    url,
    method,
}: HandleErrorResponseParams): Promise<never> {
    try {
        const errorData = await response.json();
        
        // 에러 페이로드 로깅
        console.error(`[${method || "UNKNOWN"}] ${url || response.url} - ${response.status}:`, {
            request: requestPayload,
            error: errorData?.error?.detail || errorData?.error?.message,
        });
        
        throw new Error(
            errorData?.error?.detail || 
            errorData?.error?.message || 
            `HTTP ${response.status}: ${response.statusText}`
        );
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

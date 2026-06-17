import { createSyntheticErrorResponse } from "./handle-error-response";

interface ParseJsonOrSyntheticParams {
    response: Response;
    requestPayload?: unknown;
    url: string;
    method: string;
}

export async function parseJsonOrSynthetic<T = unknown>({
    response,
    requestPayload,
    url,
    method,
}: ParseJsonOrSyntheticParams): Promise<T> {
    try {
        return (await response.json()) as T;
    } catch (error) {
        return createSyntheticErrorResponse({
            response,
            requestPayload,
            url,
            method,
            parseError: error,
        }) as unknown as T;
    }
}

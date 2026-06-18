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
        const body = await response.json();

        if (
            body &&
            typeof body === "object" &&
            "isSuccess" in body &&
            body.isSuccess === false &&
            "error" in body &&
            body.error &&
            typeof body.error === "object"
        ) {
            return {
                ...body,
                error: {
                    ...body.error,
                    status: response.status,
                },
            } as T;
        }

        return body as T;
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

import { makeRequest } from "./make-request";
import { handleErrorResponse } from "./handle-error-response";
import { refreshToken } from "./refresh-token";

class FetchInstance {
    private static instance: FetchInstance;
    private baseUrl: string;
    private constructor() {
        this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
    }

    public static getInstance(): FetchInstance {
        if (!FetchInstance.instance) {
            FetchInstance.instance = new FetchInstance();
        }
        return FetchInstance.instance;
    }

    private async makeRequest({
        url,
        method,
        data,
        options,
    }: {
        url: string;
        method: string;
        data?: unknown;
        options?: RequestInit;
    }): Promise<Response> {
        return makeRequest({
            url,
            method,
            data,
            options,
            baseUrl: this.baseUrl,
            refreshToken: () => this.refreshToken(),
        });
    }

    private async handleErrorResponse(
        response: Response,
        requestPayload?: unknown,
        url?: string,
        method?: string
    ): Promise<never> {
        return handleErrorResponse({ response, requestPayload, url, method });
    }

    private async refreshToken(): Promise<boolean> {
        return refreshToken({ baseUrl: this.baseUrl });
    }

    /**
     * GET 요청
     * @param url - 요청 URL
     * @param options - 요청 옵션
     * @returns 응답 데이터
     */
    public async get(url: string, options?: RequestInit): Promise<unknown> {
        const response = await this.makeRequest({ url, method: "GET", options });

        if (!response.ok) {
            await this.handleErrorResponse(response, undefined, url, "GET");
        }

        return response.json();
    }

    /**
     * POST 요청
     * @param url - 요청 URL
     * @param data - 요청 데이터
     * @param options - 요청 옵션
     * @returns 응답 데이터
     */
    public async post(url: string, data: unknown, options?: RequestInit): Promise<unknown> {
        const response = await this.makeRequest({
            url,
            method: "POST",
            data,
            options,
        });

        if (!response.ok) {
            await this.handleErrorResponse(response, data, url, "POST");
        }

        return response.json();
    }

    /**
     * PUT 요청
     * @param url - 요청 URL
     * @param data - 요청 데이터
     * @param options - 요청 옵션
     * @returns 응답 데이터
     */
    public async put(url: string, data: unknown, options?: RequestInit): Promise<unknown> {
        const response = await this.makeRequest({
            url,
            method: "PUT",
            data,
            options,
        });

        if (!response.ok) {
            await this.handleErrorResponse(response, data, url, "PUT");
        }

        return response.json();
    }

    /**
     * PATCH 요청
     * @param url - 요청 URL
     * @param data - 요청 데이터
     * @param options - 요청 옵션
     * @returns 응답 데이터
     */
    public async patch(url: string, data: unknown, options?: RequestInit): Promise<unknown> {
        const response = await this.makeRequest({
            url,
            method: "PATCH",
            data,
            options,
        });

        if (!response.ok) {
            await this.handleErrorResponse(response, data, url, "PATCH");
        }

        return response.json();
    }

    /**
     * DELETE 요청
     * @param url - 요청 URL
     * @param options - 요청 옵션
     * @returns 응답 데이터
     */
    public async delete(url: string, options?: RequestInit): Promise<unknown> {
        const response = await this.makeRequest({ url, method: "DELETE", options });

        if (!response.ok) {
            await this.handleErrorResponse(response, undefined, url, "DELETE");
        }

        return response.json();
    }
}

export default FetchInstance;

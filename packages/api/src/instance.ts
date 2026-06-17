import type { FetchOptions } from "./fetch-types";
import { makeRequest } from "./make-request";
import { createSyntheticErrorResponse } from "./handle-error-response";
import { refreshToken } from "./refresh-token";

class FetchInstance {
    private static instance: FetchInstance;
    private baseUrl: string;
    private constructor() {
        this.baseUrl = process.env.API_URL || "";
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
        options?: FetchOptions;
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

    private async parseJsonOrSynthetic<T = unknown>({
        response,
        requestPayload,
        url,
        method,
    }: {
        response: Response;
        requestPayload?: unknown;
        url: string;
        method: string;
    }): Promise<T> {
        try {
            return (await response.json()) as T;
        } catch (error) {
            // 서버 인터셉터를 거치지 않은 진짜 예외(HTML body 등)도 throw하지 않고 합성 실패 응답을 반환한다.
            return createSyntheticErrorResponse({
                response,
                requestPayload,
                url,
                method,
                parseError: error,
            }) as unknown as T;
        }
    }

    private async refreshToken(): Promise<{ success: boolean; accessToken?: string }> {
        return refreshToken({ baseUrl: this.baseUrl });
    }

    /**
     * GET 요청
     * @param url - 요청 URL
     * @param options - 요청 옵션
     * @returns 응답 데이터
     */
    public async get<T = unknown>(url: string, options?: FetchOptions): Promise<T> {
        const response = await this.makeRequest({ url, method: "GET", options });
        return this.parseJsonOrSynthetic<T>({ response, url, method: "GET" });
    }

    /**
     * POST 요청
     * @param url - 요청 URL
     * @param data - 요청 데이터
     * @param options - 요청 옵션
     * @returns 응답 데이터
     */
    public async post<T = unknown>(url: string, data: unknown, options?: FetchOptions): Promise<T> {
        const response = await this.makeRequest({
            url,
            method: "POST",
            data,
            options,
        });
        return this.parseJsonOrSynthetic<T>({ response, requestPayload: data, url, method: "POST" });
    }

    /**
     * PUT 요청
     * @param url - 요청 URL
     * @param data - 요청 데이터
     * @param options - 요청 옵션
     * @returns 응답 데이터
     */
    public async put<T = unknown>(url: string, data: unknown, options?: FetchOptions): Promise<T> {
        const response = await this.makeRequest({
            url,
            method: "PUT",
            data,
            options,
        });
        return this.parseJsonOrSynthetic<T>({ response, requestPayload: data, url, method: "PUT" });
    }

    /**
     * PATCH 요청
     * @param url - 요청 URL
     * @param data - 요청 데이터
     * @param options - 요청 옵션
     * @returns 응답 데이터
     */
    public async patch<T = unknown>(url: string, data: unknown, options?: FetchOptions): Promise<T> {
        const response = await this.makeRequest({
            url,
            method: "PATCH",
            data,
            options,
        });
        return this.parseJsonOrSynthetic<T>({ response, requestPayload: data, url, method: "PATCH" });
    }

    /**
     * DELETE 요청
     * @param url - 요청 URL
     * @param options - 요청 옵션
     * @returns 응답 데이터
     */
    public async delete<T = unknown>(url: string, options?: FetchOptions): Promise<T> {
        const response = await this.makeRequest({ url, method: "DELETE", options });
        return this.parseJsonOrSynthetic<T>({ response, url, method: "DELETE" });
    }
}

export default FetchInstance;

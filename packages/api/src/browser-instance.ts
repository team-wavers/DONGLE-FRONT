import { parseJsonOrSynthetic } from "./parse-json";

/**
 * 같은 origin 프록시 라우트(Next.js Route Handler)를 호출하는 브라우저 코드용 인스턴스.
 * FetchInstance와 달리 baseUrl/accessToken/refreshToken을 다루지 않는다 —
 * 인증은 프록시 라우트가 서버에서 이미 처리했다는 전제이고, 쿠키는 같은 origin이라
 * fetch 기본 credentials("same-origin")만으로 자동 전송된다.
 */
class BrowserInstance {
    private static instance: BrowserInstance;

    public static getInstance(): BrowserInstance {
        if (!BrowserInstance.instance) {
            BrowserInstance.instance = new BrowserInstance();
        }
        return BrowserInstance.instance;
    }

    private async request<T = unknown>({
        url,
        method,
        data,
        headers,
    }: {
        url: string;
        method: string;
        data?: unknown;
        headers?: HeadersInit;
    }): Promise<T> {
        const isFormData = data instanceof FormData;
        const body = data !== undefined ? (isFormData ? data : JSON.stringify(data)) : undefined;

        const response = await fetch(url, {
            method,
            ...(body !== undefined && { body }),
            headers: {
                ...(!isFormData && body !== undefined && { "Content-Type": "application/json" }),
                ...headers,
            },
        });

        return parseJsonOrSynthetic<T>({ response, requestPayload: data, url, method });
    }

    public async get<T = unknown>(url: string, headers?: HeadersInit): Promise<T> {
        return this.request<T>({ url, method: "GET", headers });
    }

    public async post<T = unknown>(url: string, data?: unknown, headers?: HeadersInit): Promise<T> {
        return this.request<T>({ url, method: "POST", data, headers });
    }

    public async put<T = unknown>(url: string, data?: unknown, headers?: HeadersInit): Promise<T> {
        return this.request<T>({ url, method: "PUT", data, headers });
    }

    public async patch<T = unknown>(url: string, data?: unknown, headers?: HeadersInit): Promise<T> {
        return this.request<T>({ url, method: "PATCH", data, headers });
    }

    public async delete<T = unknown>(url: string, headers?: HeadersInit): Promise<T> {
        return this.request<T>({ url, method: "DELETE", headers });
    }
}

export default BrowserInstance;

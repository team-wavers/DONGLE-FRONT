import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import FetchInstance from "./instance";

type SuccessBody<T> = { isSuccess: true; result: T };
type ErrorBody = { isSuccess: false; error: { message: string; detail: string; status?: number } };

function createJsonResponse(body: unknown, init: ResponseInit) {
    return new Response(JSON.stringify(body), {
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...(init.headers ?? {}),
        },
    });
}

describe("FetchInstance (instance.ts)", () => {
    beforeEach(() => {
        // makeRequest()는 window 존재 여부로 client/server를 분기한다.
        // 테스트 환경에서 Next cookies()를 타지 않도록 client 모드로 고정한다.
        vi.stubGlobal("window", {} as unknown as Window);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.unstubAllEnvs();
        vi.restoreAllMocks();
    });

    test("GET 200 + {isSuccess:true,result} → 그대로 반환", async () => {
        vi.stubEnv("API_URL", "https://api.example.com");

        const body: SuccessBody<{ ok: true }> = { isSuccess: true, result: { ok: true } };

        vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
            createJsonResponse(body, { status: 200, statusText: "OK" })
        );

        const instance = FetchInstance.getInstance();
        const res = await instance.get<typeof body>("/hello");

        expect(res).toEqual(body);
    });

    test("GET 404 + 유효한 JSON {isSuccess:false,error:{message,detail}} → throw 없이 그대로 반환", async () => {
        vi.stubEnv("API_URL", "https://api.example.com");

        const body: ErrorBody = {
            isSuccess: false,
            error: { message: "Not Found", detail: "report_id: 999" },
        };

        vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
            createJsonResponse(body, { status: 404, statusText: "Not Found" })
        );

        const instance = FetchInstance.getInstance();
        const res = await instance.get<typeof body>("/clubs/1/reports/999");

        expect(res).toEqual({
            ...body,
            error: {
                ...body.error,
                status: 404,
            },
        });
    });

    test("GET 502 + JSON 파싱 불가(HTML body 등) → throw 없이 synthetic {isSuccess:false,error:{message,detail}} 반환", async () => {
        vi.stubEnv("API_URL", "https://api.example.com");

        vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
            new Response("<html>Bad Gateway</html>", {
                status: 502,
                statusText: "Bad Gateway",
                headers: { "Content-Type": "text/html" },
            })
        );

        const instance = FetchInstance.getInstance();
        const res = await instance.get<ErrorBody>("/health");

        expect(res.isSuccess).toBe(false);
        if (!res.isSuccess) {
            expect(res.error.message).toContain("HTTP 502");
            expect(res.error.detail).toContain("Bad Gateway");
            expect(res.error.status).toBe(502);
        }
    });

    test("POST 성공 케이스도 동일하게 바디를 그대로 반환한다", async () => {
        vi.stubEnv("API_URL", "https://api.example.com");

        const body: SuccessBody<{ id: number }> = { isSuccess: true, result: { id: 1 } };
        vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
            createJsonResponse(body, { status: 200, statusText: "OK" })
        );

        const instance = FetchInstance.getInstance();
        const res = await instance.post<typeof body>("/posts", { title: "t" });

        expect(res).toEqual(body);
    });

    test("DELETE 구조화된 실패 케이스도 throw 없이 그대로 반환한다", async () => {
        vi.stubEnv("API_URL", "https://api.example.com");

        const body: ErrorBody = {
            isSuccess: false,
            error: { message: "Forbidden", detail: "no permission" },
        };
        vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
            createJsonResponse(body, { status: 403, statusText: "Forbidden" })
        );

        const instance = FetchInstance.getInstance();
        const res = await instance.delete<typeof body>("/posts/1");

        expect(res).toEqual({
            ...body,
            error: {
                ...body.error,
                status: 403,
            },
        });
    });

    test("DELETE 204 빈 바디는 성공 null 응답으로 정규화한다", async () => {
        vi.stubEnv("API_URL", "https://api.example.com");
        vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
            new Response(null, { status: 204, statusText: "No Content" })
        );

        const instance = FetchInstance.getInstance();
        const res = await instance.delete<SuccessBody<null>>("/posts/1");

        expect(res).toEqual({ isSuccess: true, result: null });
    });

    test("구조화 실패 로그에는 민감한 요청 필드 값과 이름이 포함되지 않는다", async () => {
        vi.stubEnv("API_URL", "https://api.example.com");
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
        const body: ErrorBody = {
            isSuccess: false,
            error: { message: "Unauthorized", detail: "invalid credentials" },
        };
        vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
            createJsonResponse(body, { status: 401, statusText: "Unauthorized" })
        );

        const instance = FetchInstance.getInstance();
        await instance.post("/auth/login", { login_id: "admin", password: "secret", name: "운영자" });

        const serializedLog = JSON.stringify(consoleError.mock.calls);
        expect(serializedLog).not.toContain("secret");
        expect(serializedLog).not.toContain("admin");
        expect(serializedLog).not.toContain("password");
        expect(serializedLog).not.toContain("login_id");
    });
});

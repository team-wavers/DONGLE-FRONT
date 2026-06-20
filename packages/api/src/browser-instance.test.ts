import { afterEach, describe, expect, test, vi } from "vitest";
import BrowserInstance from "./browser-instance";

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

describe("BrowserInstance (browser-instance.ts)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test("POST 성공 케이스는 JSON body로 직렬화되고 Content-Type을 자동으로 붙인다", async () => {
        const body: SuccessBody<{ ok: true }> = { isSuccess: true, result: { ok: true } };
        const fetchSpy = vi
            .spyOn(globalThis, "fetch")
            .mockResolvedValueOnce(createJsonResponse(body, { status: 200, statusText: "OK" }));

        const instance = BrowserInstance.getInstance();
        const res = await instance.post<typeof body>("/api/clubs/registration-urls", { foo: "bar" });

        expect(res).toEqual(body);
        const [, init] = fetchSpy.mock.calls[0];
        expect(init?.body).toBe(JSON.stringify({ foo: "bar" }));
        expect((init?.headers as Record<string, string>)["Content-Type"]).toBe("application/json");
    });

    test("FormData를 넘기면 직렬화하지 않고 Content-Type도 강제하지 않는다", async () => {
        const body: SuccessBody<string> = { isSuccess: true, result: "https://example.com/img.png" };
        const fetchSpy = vi
            .spyOn(globalThis, "fetch")
            .mockResolvedValueOnce(createJsonResponse(body, { status: 200, statusText: "OK" }));

        const formData = new FormData();
        formData.append("file", new File(["x"], "x.png"));

        const instance = BrowserInstance.getInstance();
        const res = await instance.post<typeof body>("/api/clubs/1/report-images", formData);

        expect(res).toEqual(body);
        const [, init] = fetchSpy.mock.calls[0];
        expect(init?.body).toBe(formData);
        expect((init?.headers as Record<string, string>)["Content-Type"]).toBeUndefined();
    });

    test("구조화된 실패 응답(isSuccess:false)은 throw 없이 그대로 반환한다", async () => {
        const body: ErrorBody = { isSuccess: false, error: { message: "Unauthorized", detail: "토큰이 없습니다." } };
        vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
            createJsonResponse(body, { status: 401, statusText: "Unauthorized" })
        );

        const instance = BrowserInstance.getInstance();
        const res = await instance.post<ErrorBody>("/api/clubs/registration-urls");

        expect(res).toEqual({
            ...body,
            error: {
                ...body.error,
                status: 401,
            },
        });
    });

    test("JSON 파싱 불가(HTML body 등) 응답은 throw 없이 synthetic 실패로 정규화한다", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
            new Response("<html>Bad Gateway</html>", {
                status: 502,
                statusText: "Bad Gateway",
                headers: { "Content-Type": "text/html" },
            })
        );

        const instance = BrowserInstance.getInstance();
        const res = await instance.get<ErrorBody>("/api/clubs/registration-urls");

        expect(res.isSuccess).toBe(false);
        if (!res.isSuccess) {
            expect(res.error.message).toContain("HTTP 502");
            expect(res.error.status).toBe(502);
        }
    });
});

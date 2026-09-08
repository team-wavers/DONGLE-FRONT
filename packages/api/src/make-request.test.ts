import { afterEach, describe, expect, test, vi } from "vitest";
import { makeRequest, shouldAttemptTokenRefresh } from "./make-request";

vi.mock("./utils/cookie/server-cookie.util", () => ({
    getAccessTokenFromServerCookie: vi.fn().mockResolvedValue("old-token"),
}));

afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
});

describe("shouldAttemptTokenRefresh", () => {
    test("401 응답이면 일반 API 요청은 토큰 갱신 대상이다", () => {
        expect(shouldAttemptTokenRefresh({ status: 401, hasRetried: false })).toBe(true);
    });

    test("skipAuthRefresh 옵션이 있으면 401이어도 토큰 갱신 대상에서 제외한다", () => {
        expect(shouldAttemptTokenRefresh({ status: 401, skipAuthRefresh: true, hasRetried: false })).toBe(false);
    });

    test("이미 토큰 갱신 후 재시도한 요청은 다시 갱신하지 않는다", () => {
        expect(shouldAttemptTokenRefresh({ status: 401, hasRetried: true })).toBe(false);
    });

    test("401이 아닌 응답은 토큰 갱신 대상이 아니다", () => {
        expect(shouldAttemptTokenRefresh({ status: 403, hasRetried: false })).toBe(false);
    });
});

describe("makeRequest", () => {
    test("401이면 토큰 갱신 후 새 Authorization으로 원 요청을 한 번 재시도한다", async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(new Response(null, { status: 401 }))
            .mockResolvedValueOnce(new Response(null, { status: 200 }));
        const refreshToken = vi.fn().mockResolvedValue({ success: true, accessToken: "new-token" });
        vi.stubGlobal("fetch", fetchMock);

        const response = await makeRequest({
            url: "/clubs",
            method: "GET",
            baseUrl: "https://api.example.com",
            refreshToken,
        });

        expect(response.status).toBe(200);
        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(fetchMock).toHaveBeenNthCalledWith(
            2,
            "https://api.example.com/clubs",
            expect.objectContaining({ headers: expect.objectContaining({ Authorization: "Bearer new-token" }) })
        );
        expect(refreshToken).toHaveBeenCalledTimes(1);
    });

    test("skipAuthRefresh이면 401이어도 토큰을 갱신하지 않는다", async () => {
        const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 401 }));
        const refreshToken = vi.fn();
        vi.stubGlobal("fetch", fetchMock);

        const response = await makeRequest({
            url: "/auth/login",
            method: "POST",
            baseUrl: "https://api.example.com",
            refreshToken,
            options: { skipAuthRefresh: true },
        });

        expect(response.status).toBe(401);
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(refreshToken).not.toHaveBeenCalled();
    });

    test("갱신 성공 응답에 accessToken이 없어도 재귀 갱신은 한 번에서 멈춘다", async () => {
        const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 401 }));
        const refreshToken = vi.fn().mockResolvedValue({ success: true });
        vi.stubGlobal("fetch", fetchMock);

        const response = await makeRequest({
            url: "/clubs",
            method: "GET",
            baseUrl: "https://api.example.com",
            refreshToken,
        });

        expect(response.status).toBe(401);
        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(refreshToken).toHaveBeenCalledTimes(1);
    });

    test("토큰 갱신이 실패하면 원본 401 응답을 반환하고 재시도하지 않는다", async () => {
        const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 401 }));
        const refreshToken = vi.fn().mockResolvedValue({ success: false });
        vi.stubGlobal("fetch", fetchMock);

        const response = await makeRequest({
            url: "/clubs",
            method: "GET",
            baseUrl: "https://api.example.com",
            refreshToken,
        });

        expect(response.status).toBe(401);
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(refreshToken).toHaveBeenCalledTimes(1);
    });
});

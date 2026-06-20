import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { POST } from "./route";

vi.mock("next/cache", () => ({
    revalidateTag: vi.fn(),
}));

const ORIGINAL_ENV = { ...process.env };

function buildRequest(body: unknown, secret?: string) {
    return new NextRequest("https://client.example.com/api/revalidate", {
        method: "POST",
        headers: secret !== undefined ? { "x-revalidate-secret": secret } : undefined,
        body: typeof body === "string" ? body : JSON.stringify(body),
    });
}

describe("POST /api/revalidate", () => {
    beforeEach(() => {
        process.env.REVALIDATE_SECRET = "test-secret";
    });

    afterEach(() => {
        process.env = { ...ORIGINAL_ENV };
        vi.clearAllMocks();
    });

    test("시크릿 헤더가 없으면 401을 반환한다", async () => {
        const response = await POST(buildRequest({ tags: ["main-banner"] }));

        expect(response.status).toBe(401);
        expect(revalidateTag).not.toHaveBeenCalled();
    });

    test("시크릿이 일치하지 않으면 401을 반환한다", async () => {
        const response = await POST(buildRequest({ tags: ["main-banner"] }, "wrong-secret"));

        expect(response.status).toBe(401);
        expect(revalidateTag).not.toHaveBeenCalled();
    });

    test("시크릿이 일치하고 tags가 정상이면 200을 반환하고 각 태그를 무효화한다", async () => {
        const response = await POST(buildRequest({ tags: ["main-banner", "club-schedule-club-1"] }, "test-secret"));

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ revalidated: true });
        expect(revalidateTag).toHaveBeenCalledWith("main-banner");
        expect(revalidateTag).toHaveBeenCalledWith("club-schedule-club-1");
    });

    test("tags가 배열이 아니면 400을 반환한다", async () => {
        const response = await POST(buildRequest({ tags: "main-banner" }, "test-secret"));

        expect(response.status).toBe(400);
        expect(revalidateTag).not.toHaveBeenCalled();
    });

    test("tags 배열에 문자열이 아닌 원소가 있으면 400을 반환한다", async () => {
        const response = await POST(buildRequest({ tags: ["main-banner", 1] }, "test-secret"));

        expect(response.status).toBe(400);
        expect(revalidateTag).not.toHaveBeenCalled();
    });

    test("body JSON 파싱에 실패하면 400을 반환한다", async () => {
        const response = await POST(buildRequest("not-json", "test-secret"));

        expect(response.status).toBe(400);
        expect(revalidateTag).not.toHaveBeenCalled();
    });
});

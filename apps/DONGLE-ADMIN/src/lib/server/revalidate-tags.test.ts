import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { revalidateTag } from "next/cache";
import { revalidateTags } from "./revalidate-tags";

vi.mock("next/cache", () => ({
    revalidateTag: vi.fn(),
}));

const ORIGINAL_ENV = { ...process.env };

describe("revalidateTags", () => {
    beforeEach(() => {
        process.env.CLIENT_BASE_URL = "https://client.example.com";
        process.env.REVALIDATE_SECRET = "test-secret";
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
    });

    afterEach(() => {
        process.env = { ...ORIGINAL_ENV };
        vi.unstubAllGlobals();
        vi.clearAllMocks();
    });

    test("모든 태그에 대해 revalidateTag를 그대로 호출한다", () => {
        revalidateTags(["club", "club-1"]);

        expect(revalidateTag).toHaveBeenCalledWith("club");
        expect(revalidateTag).toHaveBeenCalledWith("club-1");
    });

    test("main-banner 태그는 CLIENT로 무효화 요청을 보낸다", async () => {
        revalidateTags(["main-banner"]);
        await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

        const [url, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
        expect(url).toBe("https://client.example.com/api/revalidate");
        expect(init.method).toBe("POST");
        expect(init.headers["x-revalidate-secret"]).toBe("test-secret");
        expect(JSON.parse(init.body)).toEqual({ tags: ["main-banner"] });
    });

    test("main-banner-3, club-schedule-club-1 처럼 prefix가 일치하면 CLIENT로 무효화 요청을 보낸다", async () => {
        revalidateTags(["main-banner-3"]);
        await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
        expect(JSON.parse((fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body)).toEqual({
            tags: ["main-banner-3"],
        });

        vi.clearAllMocks();

        revalidateTags(["club-schedule-club-1"]);
        await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
        expect(JSON.parse((fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body)).toEqual({
            tags: ["club-schedule-club-1"],
        });
    });

    test("club, report, user 태그는 CLIENT로 무효화 요청을 보내지 않는다", async () => {
        revalidateTags(["club"]);
        revalidateTags(["report"]);
        revalidateTags(["user"]);

        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(fetch).not.toHaveBeenCalled();
    });

    test("club과 main-banner가 섞이면 main-banner만 CLIENT로 전달한다", async () => {
        revalidateTags(["club", "main-banner"]);
        await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

        expect(JSON.parse((fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body)).toEqual({
            tags: ["main-banner"],
        });
    });

    test("CLIENT_BASE_URL이 없으면 CLIENT로 무효화 요청을 보내지 않는다", async () => {
        delete process.env.CLIENT_BASE_URL;

        revalidateTags(["main-banner"]);
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(fetch).not.toHaveBeenCalled();
    });

    test("REVALIDATE_SECRET이 없으면 CLIENT로 무효화 요청을 보내지 않는다", async () => {
        delete process.env.REVALIDATE_SECRET;

        revalidateTags(["main-banner"]);
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(fetch).not.toHaveBeenCalled();
    });

    test("CLIENT 요청이 실패해도 에러를 던지지 않는다", () => {
        vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network error")));

        expect(() => revalidateTags(["main-banner"])).not.toThrow();
    });
});

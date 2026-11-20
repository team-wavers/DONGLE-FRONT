import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { setupServer } from "msw/node";
import clubReportHandlers from "./club.report";
import * as fixtures from "../fixtures";

const server = setupServer(...clubReportHandlers);
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterAll(() => server.close());
afterEach(() => vi.restoreAllMocks());

describe("공개 최근 활동 mock", () => {
    it("통합 경로에서 최대 네 동아리의 lean DTO를 반환한다", async () => {
        const response = await fetch("https://api.example.com/v1/clubs/reports/recent");
        const body = await response.json();
        expect(response.status).toBe(200);
        expect(body.isSuccess).toBe(true);
        expect(body.result.length).toBeGreaterThan(0);
        expect(body.result.length).toBeLessThanOrEqual(4);
        expect(new Set(body.result.map((item: { club_id: number }) => item.club_id)).size).toBe(body.result.length);
        for (const item of body.result) {
            expect(Object.keys(item).sort()).toEqual([
                "club_id",
                "club_name",
                "createdAt",
                "id",
                "thumbnail_url",
                "title",
            ]);
            expect(typeof item.club_name).toBe("string");
            expect(typeof item.club_id).toBe("number");
        }
    });

    it("첨부 이미지가 없으면 본문 첫 이미지를 썸네일로 반환한다", async () => {
        vi.spyOn(fixtures, "mockReportsForClub").mockImplementation((clubId) => [
            {
                id: clubId,
                club_id: clubId,
                title: "본문 사진 활동",
                content: '<p>활동</p><img alt="사진" src="https://example.com/body.jpg">',
                image_urls: ["", " "],
                createdAt: "2026-11-10T00:00:00Z",
                updatedAt: "2026-11-10T00:00:00Z",
                deletedAt: null,
            },
        ]);

        const response = await fetch("https://api.example.com/v1/clubs/reports/recent");
        const body = await response.json();

        expect(body.result.length).toBeGreaterThan(0);
        expect(
            body.result.every(
                (item: { thumbnail_url: string }) => item.thumbnail_url === "https://example.com/body.jpg"
            )
        ).toBe(true);
    });
});

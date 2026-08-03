import { afterEach, describe, expect, test, vi } from "vitest";
import { getAdminDashboardService } from "@/lib/server/cached-services";
import { getAdminHomeData } from "./admin-home-data";

vi.mock("@/lib/server/cached-services", () => ({
    getAdminDashboardService: vi.fn(),
}));

describe("getAdminHomeData", () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    test("성공 응답은 집계 데이터를 그대로 반환한다", async () => {
        const result = {
            clubs: { total: 12, recruiting: 3, recent: [] },
            users: { total: 7, recent: [] },
            banners: { total: 5, active: 2 },
            schedules: { thisMonth: 9 },
        };
        vi.mocked(getAdminDashboardService).mockResolvedValue({
            isSuccess: true,
            result,
        });

        const data = await getAdminHomeData();

        expect(data).toEqual({ isError: false, ...result });
    });

    test("API가 실패 응답을 반환하면 isError와 함께 빈 기본값을 반환한다", async () => {
        vi.mocked(getAdminDashboardService).mockResolvedValue({
            isSuccess: false,
            error: { message: "실패", detail: "detail" },
        });

        const data = await getAdminHomeData();

        expect(data.isError).toBe(true);
        expect(data.clubs).toEqual({ total: 0, recruiting: 0, recent: [] });
        expect(data.users).toEqual({ total: 0, recent: [] });
        expect(data.banners).toEqual({ total: 0, active: 0 });
        expect(data.schedules).toEqual({ thisMonth: 0 });
    });

    test("네트워크 예외가 발생해도 throw 없이 isError와 빈 기본값을 반환한다", async () => {
        vi.mocked(getAdminDashboardService).mockRejectedValue(new Error("network down"));

        const data = await getAdminHomeData();

        expect(data.isError).toBe(true);
        expect(data.clubs).toEqual({ total: 0, recruiting: 0, recent: [] });
        expect(data.schedules).toEqual({ thisMonth: 0 });
    });
});

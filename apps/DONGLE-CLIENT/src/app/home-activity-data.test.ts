import type { Club } from "@dongle/types/club/club";
import type { ClubReport } from "@dongle/types/club/club.report";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getClubListService, getClubReportListService } from "@/lib/server/cached-services";
import { loadHomeActivityReports } from "./home-activity-data";

vi.mock("@/lib/server/cached-services", () => ({
    getClubListService: vi.fn(),
    getClubReportListService: vi.fn(),
}));

function club(id: number): Club {
    return {
        id,
        name: `동아리 ${id}`,
        icon_url: null,
        is_recruiting: false,
        category: "학술분과",
        sns: {},
        tags: [],
        recruit_start: "",
        recruit_end: "",
        description: "",
        main_activities: "",
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
        deleted_at: null,
        president: { id, name: "회장", phone: "" },
        location: "",
    };
}

function report(id: number): ClubReport {
    return {
        id,
        title: `활동 ${id}`,
        content: "<p>활동 소식</p>",
        image_urls: [],
        createdAt: "2026-11-01T00:00:00Z",
        updatedAt: "2026-11-01T00:00:00Z",
        deletedAt: null,
        club_id: id,
    };
}

const failure = { isSuccess: false, error: { message: "조회 실패", detail: "" } } as const;

afterEach(() => {
    vi.resetAllMocks();
});

describe("loadHomeActivityReports", () => {
    it("공개 동아리별 목록을 조회하고 부모 동아리 정보와 연결한다", async () => {
        vi.mocked(getClubListService).mockResolvedValue({ isSuccess: true, result: [club(2)] });
        vi.mocked(getClubReportListService).mockResolvedValue({ isSuccess: true, result: [report(178)] });

        const result = await loadHomeActivityReports();

        expect(getClubListService).toHaveBeenCalledTimes(1);
        expect(getClubReportListService).toHaveBeenCalledTimes(1);
        expect(vi.mocked(getClubReportListService).mock.calls[0]?.[0]).toBe(2);
        expect(vi.mocked(getClubReportListService).mock.calls[0]?.[1]).not.toBe("admin");
        expect(result).toMatchObject([{ reportId: 178, clubId: 2, clubName: "동아리 2" }]);
    });

    it("일부 동아리의 실패 응답이나 네트워크 예외가 있어도 성공한 소식을 표시한다", async () => {
        vi.mocked(getClubListService).mockResolvedValue({ isSuccess: true, result: [club(1), club(2), club(3)] });
        vi.mocked(getClubReportListService).mockImplementation(async (clubId) => {
            if (clubId === 1) return failure;
            if (clubId === 2) throw new Error("network error");
            return { isSuccess: true, result: [report(33)] };
        });

        await expect(loadHomeActivityReports()).resolves.toMatchObject([{ clubId: 3, reportId: 33 }]);
    });

    it("모든 보고서 조회가 실패해도 빈 소식으로 정규화한다", async () => {
        vi.mocked(getClubListService).mockResolvedValue({ isSuccess: true, result: [club(1), club(2)] });
        vi.mocked(getClubReportListService).mockRejectedValue(new Error("network error"));

        await expect(loadHomeActivityReports()).resolves.toEqual([]);
    });

    it.each(["실패 응답", "네트워크 예외"])("동아리 목록 %s이면 보고서를 요청하지 않고 빈 소식을 반환한다", async (mode) => {
        if (mode === "실패 응답") vi.mocked(getClubListService).mockResolvedValue(failure);
        else vi.mocked(getClubListService).mockRejectedValue(new Error("network error"));

        await expect(loadHomeActivityReports()).resolves.toEqual([]);
        expect(getClubReportListService).not.toHaveBeenCalled();
    });

    it("동아리 목록이 비어 있으면 보고서 요청을 보내지 않는다", async () => {
        vi.mocked(getClubListService).mockResolvedValue({ isSuccess: true, result: [] });

        await expect(loadHomeActivityReports()).resolves.toEqual([]);
        expect(getClubReportListService).not.toHaveBeenCalled();
    });

    it("공개 보고서 요청은 병렬로 처리하되 동시에 여섯 건을 넘기지 않는다", async () => {
        const clubs = Array.from({ length: 12 }, (_, index) => club(index + 1));
        vi.mocked(getClubListService).mockResolvedValue({ isSuccess: true, result: clubs });
        let active = 0;
        let peak = 0;
        vi.mocked(getClubReportListService).mockImplementation(async () => {
            active += 1;
            peak = Math.max(peak, active);
            await new Promise<void>((resolve) => setTimeout(resolve, 0));
            active -= 1;
            return { isSuccess: true, result: [] };
        });

        await loadHomeActivityReports();

        expect(getClubReportListService).toHaveBeenCalledTimes(12);
        expect(peak).toBeGreaterThan(1);
        expect(peak).toBeLessThanOrEqual(6);
        expect(active).toBe(0);
    });
});

import { afterEach, describe, expect, test, vi } from "vitest";
import { deleteAdminClubScheduleService, deleteClubScheduleService } from "@dongle/service";
import { revalidateTag } from "next/cache";
import { deleteAdminClubScheduleAction, deleteClubScheduleAction } from "./schedule.action";

vi.mock("@dongle/service", async () => {
    const actual = await vi.importActual<typeof import("@dongle/service")>("@dongle/service");

    return {
        ...actual,
        deleteAdminClubScheduleService: vi.fn(),
        deleteClubScheduleService: vi.fn(),
    };
});

vi.mock("@/shared/action/server-action-auth", () => ({
    requireServerActionAccessToken: vi.fn().mockResolvedValue("access-token"),
}));

vi.mock("@/lib/sentry/capture-server-exception", () => ({
    captureServerException: vi.fn(),
}));

vi.mock("next/cache", () => ({
    revalidateTag: vi.fn(),
}));

describe("schedule actions", () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    test("관리자 일정 삭제 성공 시 관리자 일정 삭제 서비스와 일정 태그 초기화를 호출한다", async () => {
        vi.mocked(deleteAdminClubScheduleService).mockResolvedValue({
            isSuccess: true,
            result: { affected: 1 },
        } as Awaited<ReturnType<typeof deleteAdminClubScheduleService>>);

        const result = await deleteAdminClubScheduleAction(7);

        expect(result).toEqual({ success: true, result: null });
        expect(deleteAdminClubScheduleService).toHaveBeenCalledWith(7);
        expect(revalidateTag).toHaveBeenCalledWith("club-schedule");
        expect(revalidateTag).toHaveBeenCalledWith("club-schedule-item-7");
    });

    test("회장 일정 삭제 성공 시 회장 일정 삭제 서비스와 일정 태그 초기화를 호출한다", async () => {
        vi.mocked(deleteClubScheduleService).mockResolvedValue({
            isSuccess: true,
            result: { affected: 1 },
        } as Awaited<ReturnType<typeof deleteClubScheduleService>>);

        const result = await deleteClubScheduleAction(1, 7);

        expect(result).toEqual({ success: true, result: null });
        expect(deleteClubScheduleService).toHaveBeenCalledWith(1, 7);
        expect(revalidateTag).toHaveBeenCalledWith("club-schedule");
        expect(revalidateTag).toHaveBeenCalledWith("club-schedule-club-1");
        expect(revalidateTag).toHaveBeenCalledWith("club-schedule-item-7");
    });

    test("회장 일정 삭제 서비스 실패 시 실패 응답을 반환하고 태그를 초기화하지 않는다", async () => {
        vi.mocked(deleteClubScheduleService).mockResolvedValue({
            isSuccess: false,
            error: {
                message: "delete failed",
                detail: "삭제 권한이 없습니다.",
            },
        } as Awaited<ReturnType<typeof deleteClubScheduleService>>);

        const result = await deleteClubScheduleAction(1, 7);

        expect(result).toEqual({ success: false, error: "삭제 권한이 없습니다." });
        expect(revalidateTag).not.toHaveBeenCalled();
    });

    test("관리자 일정 삭제 서비스 실패 시 실패 응답을 반환하고 태그를 초기화하지 않는다", async () => {
        vi.mocked(deleteAdminClubScheduleService).mockResolvedValue({
            isSuccess: false,
            error: {
                message: "delete failed",
                detail: "이미 삭제된 일정입니다.",
            },
        } as Awaited<ReturnType<typeof deleteAdminClubScheduleService>>);

        const result = await deleteAdminClubScheduleAction(7);

        expect(result).toEqual({ success: false, error: "이미 삭제된 일정입니다." });
        expect(revalidateTag).not.toHaveBeenCalled();
    });
});

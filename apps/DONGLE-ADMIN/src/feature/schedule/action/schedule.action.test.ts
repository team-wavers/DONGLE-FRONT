import { afterEach, describe, expect, test, vi } from "vitest";
import {
    createClubScheduleService,
    deleteAdminClubScheduleService,
    deleteClubScheduleService,
    getAdminClubScheduleCalendarService,
    updateAdminClubScheduleStatusService,
    updateClubScheduleService,
} from "@dongle/service";
import { revalidateTag } from "next/cache";
import {
    createClubScheduleAction,
    deleteAdminClubScheduleAction,
    deleteClubScheduleAction,
    getAdminClubScheduleCalendarAction,
    updateAdminClubScheduleStatusAction,
    updateClubScheduleAction,
} from "./schedule.action";

vi.mock("@dongle/service", async () => {
    const actual = await vi.importActual<typeof import("@dongle/service")>("@dongle/service");

    return {
        ...actual,
        createClubScheduleService: vi.fn(),
        deleteAdminClubScheduleService: vi.fn(),
        deleteClubScheduleService: vi.fn(),
        getAdminClubScheduleCalendarService: vi.fn(),
        updateAdminClubScheduleStatusService: vi.fn(),
        updateClubScheduleService: vi.fn(),
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
    const apiSchedule = {
        id: 7,
        club_id: 1,
        title: "CMUX 일정",
        type: "event",
        start_at: "2026-06-16 20:00:00",
        end_at: "2026-06-16 22:00:00",
        is_public: true,
        location: "",
        description: "",
        external_url: null,
        created_at: "2026-06-01T00:00:00.000Z",
        updated_at: "2026-06-01T00:00:00.000Z",
        deleted_at: null,
    } as const;

    afterEach(() => {
        vi.clearAllMocks();
    });

    test("회장 일정 생성은 폼 값을 검증해 payload로 변환하고 ActionResult 성공 응답을 반환한다", async () => {
        vi.mocked(createClubScheduleService).mockResolvedValue(apiSchedule);

        const result = await createClubScheduleAction(1, {
            title: " CMUX 일정 ",
            type: "event",
            startsAt: "2026-06-16T20:00",
            endsAt: "2026-06-16T22:00",
            isPublic: true,
            location: "  ",
            description: "",
            externalUrl: "",
        });

        expect(result).toEqual({
            ok: true,
            data: apiSchedule,
            message: "일정이 등록되었습니다.",
        });
        expect(createClubScheduleService).toHaveBeenCalledWith(1, {
            title: "CMUX 일정",
            type: "event",
            start_at: "2026-06-16 20:00:00",
            end_at: "2026-06-16 22:00:00",
            is_public: true,
            location: "",
            description: "",
            external_url: "",
        });
        expect(revalidateTag).toHaveBeenCalledWith("club-schedule");
        expect(revalidateTag).toHaveBeenCalledWith("club-schedule-club-1");
        expect(revalidateTag).toHaveBeenCalledWith("club-schedule-item-7");
    });

    test("회장 일정 수정 검증 실패 시 fieldErrors를 반환하고 서비스는 호출하지 않는다", async () => {
        const result = await updateClubScheduleAction(1, 7, {
            title: "",
            type: "event",
            startsAt: "2026-06-16T22:00",
            endsAt: "2026-06-16T20:00",
            isPublic: true,
            location: "",
            description: "",
            externalUrl: "",
        });

        expect(result).toMatchObject({
            ok: false,
            formError: "일정 정보를 다시 확인해주세요.",
            fieldErrors: {
                title: "일정 제목을 입력해주세요.",
                endsAt: "종료일시는 시작일시보다 늦어야 합니다.",
            },
        });
        expect(updateClubScheduleService).not.toHaveBeenCalled();
    });

    test("관리자 일정 공개 상태 변경 성공 시 ActionResult data를 반환한다", async () => {
        vi.mocked(updateAdminClubScheduleStatusService).mockResolvedValue({
            ...apiSchedule,
            is_public: false,
            club: {
                id: 1,
                name: "CMUX",
                category: "학술분과",
            },
        });

        const result = await updateAdminClubScheduleStatusAction(7, false);

        expect(result).toMatchObject({
            ok: true,
            data: {
                id: 7,
                is_public: false,
            },
        });
        expect(updateAdminClubScheduleStatusService).toHaveBeenCalledWith(7, { is_public: false });
        expect(revalidateTag).toHaveBeenCalledWith("club-schedule");
        expect(revalidateTag).toHaveBeenCalledWith("club-schedule-item-7");
    });

    test("관리자 월간 일정 조회 성공 시 ActionResult data를 반환한다", async () => {
        const adminSchedule = {
            ...apiSchedule,
            club: {
                id: 1,
                name: "CMUX",
                category: "학술분과",
            },
        };
        vi.mocked(getAdminClubScheduleCalendarService).mockResolvedValue([adminSchedule]);

        const result = await getAdminClubScheduleCalendarAction({
            from: "2026-06-01 00:00:00",
            to: "2026-06-30 23:59:59",
        });

        expect(result).toEqual({
            ok: true,
            data: [adminSchedule],
        });
        expect(getAdminClubScheduleCalendarService).toHaveBeenCalledWith({
            from: "2026-06-01 00:00:00",
            to: "2026-06-30 23:59:59",
        });
    });

    test("관리자 일정 삭제 성공 시 관리자 일정 삭제 서비스와 일정 태그 초기화를 호출한다", async () => {
        vi.mocked(deleteAdminClubScheduleService).mockResolvedValue({
            isSuccess: true,
            result: { affected: 1 },
        } as Awaited<ReturnType<typeof deleteAdminClubScheduleService>>);

        const result = await deleteAdminClubScheduleAction(7);

        expect(result).toEqual({ ok: true, data: null, message: "일정이 삭제되었습니다." });
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

        expect(result).toEqual({ ok: true, data: null, message: "일정이 삭제되었습니다." });
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

        expect(result).toEqual({ ok: false, formError: "삭제 권한이 없습니다." });
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

        expect(result).toEqual({ ok: false, formError: "이미 삭제된 일정입니다." });
        expect(revalidateTag).not.toHaveBeenCalled();
    });
});

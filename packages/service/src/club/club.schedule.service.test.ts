import { beforeEach, describe, expect, test, vi } from "vitest";
import type { AdminClubSchedule, ClubSchedule } from "@dongle/types/club/club.schedule";

const fetchInstanceMock = vi.hoisted(() => ({
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
}));

vi.mock("@dongle/api/instance", () => ({
    default: {
        getInstance: () => fetchInstanceMock,
    },
}));

import {
    createClubScheduleService,
    deleteAdminClubScheduleService,
    deleteClubScheduleService,
    getAdminClubScheduleCalendarService,
    getAdminClubScheduleListService,
    getAdminClubScheduleService,
    getClubPublicScheduleListService,
    getClubScheduleListService,
    updateAdminClubScheduleStatusService,
    updateClubScheduleService,
} from "./club.schedule.service";

const clubSchedule = {
    id: 1,
    club_id: 1,
    title: "정기 모임",
    type: "regular_meeting",
    start_at: "2026-05-20T10:00:00.000Z",
    end_at: "2026-05-20T12:00:00.000Z",
    is_public: true,
    location: "학생회관",
    description: "5월 정기 모임",
    external_url: null,
    created_at: "2026-05-01T00:00:00.000Z",
    updated_at: "2026-05-01T00:00:00.000Z",
    deleted_at: null,
} satisfies ClubSchedule;

const adminClubSchedule = {
    ...clubSchedule,
    club: {
        id: 1,
        name: "UCDC",
        category: "학술",
    },
} satisfies AdminClubSchedule;

describe("club schedule service endpoints", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        fetchInstanceMock.get.mockResolvedValue({ isSuccess: true, result: [] });
        fetchInstanceMock.post.mockResolvedValue({ isSuccess: true, result: { id: 1 } });
        fetchInstanceMock.patch.mockResolvedValue({ isSuccess: true, result: { id: 1 } });
        fetchInstanceMock.delete.mockResolvedValue({ isSuccess: true, result: { affected: 1 } });
    });

    test("사용자 공개 일정 목록은 공개 엔드포인트를 호출하고 응답 result를 반환한다", async () => {
        fetchInstanceMock.get.mockResolvedValueOnce({ isSuccess: true, result: [clubSchedule] });

        const result = await getClubPublicScheduleListService(1);

        expect(fetchInstanceMock.get).toHaveBeenCalledWith("/clubs/1/public-schedules", {
            cache: "force-cache",
            next: {
                tags: ["club-schedule", "club-schedule-club-1"],
                revalidate: 60,
            },
        });
        expect(result).toEqual([clubSchedule]);
    });

    test("회장 일정 목록은 status query를 포함해 호출하고 응답 result를 반환한다", async () => {
        fetchInstanceMock.get.mockResolvedValueOnce({ isSuccess: true, result: [{ ...clubSchedule, id: 2 }] });

        const result = await getClubScheduleListService(1, "upcoming");

        expect(fetchInstanceMock.get).toHaveBeenCalledWith("/clubs/1/schedules?status=upcoming", {
            cache: "no-store",
        });
        expect(result).toEqual([{ ...clubSchedule, id: 2 }]);
    });

    test("회장 일정 생성은 일정 생성 엔드포인트와 payload를 호출한다", async () => {
        const payload = {
            title: "정기 모임",
            type: "regular_meeting" as const,
            start_at: "2026-05-20 19:00:00",
            end_at: "2026-05-20 21:00:00",
            is_public: true,
            location: "학생회관",
            description: "5월 정기 모임",
            external_url: null,
        };

        const result = await createClubScheduleService(1, payload);

        expect(fetchInstanceMock.post).toHaveBeenCalledWith("/clubs/1/schedules", payload);
        expect(result).toEqual({ id: 1 });
    });

    test("회장 일정 수정은 일정 수정 엔드포인트와 payload를 호출한다", async () => {
        const result = await updateClubScheduleService(1, 7, { title: "수정된 일정" });

        expect(fetchInstanceMock.patch).toHaveBeenCalledWith(
            "/clubs/1/schedules/7",
            { title: "수정된 일정" }
        );
        expect(result).toEqual({ id: 1 });
    });

    test("회장 일정 삭제는 일정 삭제 엔드포인트를 호출한다", async () => {
        await deleteClubScheduleService(1, 7);

        expect(fetchInstanceMock.delete).toHaveBeenCalledWith("/clubs/1/schedules/7");
    });

    test("관리자 일정 목록은 query를 포함해 호출하고 응답 result를 반환한다", async () => {
        fetchInstanceMock.get.mockResolvedValueOnce({ isSuccess: true, result: [{ ...adminClubSchedule, id: 4 }] });

        const result = await getAdminClubScheduleListService({
            clubName: "UCDC",
            category: "학술",
            type: "event",
            isPublic: true,
            from: "2026-05-01 00:00:00",
            to: "2026-05-31 23:59:59",
        });

        expect(fetchInstanceMock.get).toHaveBeenCalledWith(
            "/club-schedules?clubName=UCDC&category=%ED%95%99%EC%88%A0&type=event&isPublic=true&from=2026-05-01+00%3A00%3A00&to=2026-05-31+23%3A59%3A59",
            {
                cache: "no-store",
            }
        );
        expect(result).toEqual([{ ...adminClubSchedule, id: 4 }]);
    });

    test("관리자 캘린더 일정은 기간 query를 포함해 호출하고 응답 result를 반환한다", async () => {
        fetchInstanceMock.get.mockResolvedValueOnce({ isSuccess: true, result: [{ ...adminClubSchedule, id: 3 }] });

        const result = await getAdminClubScheduleCalendarService({
            from: "2026-05-01 00:00:00",
            to: "2026-05-31 23:59:59",
        });

        expect(fetchInstanceMock.get).toHaveBeenCalledWith(
            "/club-schedules/calendar?from=2026-05-01+00%3A00%3A00&to=2026-05-31+23%3A59%3A59",
            {
                cache: "no-store",
            }
        );
        expect(result).toEqual([{ ...adminClubSchedule, id: 3 }]);
    });

    test("관리자 일정 상세는 단건 엔드포인트를 호출한다", async () => {
        fetchInstanceMock.get.mockResolvedValueOnce({ isSuccess: true, result: { ...adminClubSchedule, id: 7 } });

        const result = await getAdminClubScheduleService(7);

        expect(fetchInstanceMock.get).toHaveBeenCalledWith("/club-schedules/7", {
            cache: "no-store",
        });
        expect(result).toEqual({ ...adminClubSchedule, id: 7 });
    });

    test("관리자 공개 상태 변경은 admin-status 엔드포인트와 payload를 호출한다", async () => {
        const result = await updateAdminClubScheduleStatusService(7, { is_public: false });

        expect(fetchInstanceMock.patch).toHaveBeenCalledWith(
            "/club-schedules/7/admin-status",
            { is_public: false }
        );
        expect(result).toEqual({ id: 1 });
    });

    test("관리자 일정 삭제는 관리자 삭제 엔드포인트를 호출한다", async () => {
        await deleteAdminClubScheduleService(7);

        expect(fetchInstanceMock.delete).toHaveBeenCalledWith("/club-schedules/7");
    });
});

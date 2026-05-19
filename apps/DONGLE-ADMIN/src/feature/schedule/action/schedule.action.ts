"use server";

import {
    clubScheduleTagGroups,
    createClubScheduleService,
    deleteAdminClubScheduleService,
    deleteClubScheduleService,
    getAdminClubScheduleCalendarService,
    updateAdminClubScheduleStatusService,
    updateClubScheduleService,
} from "@dongle/service";
import type {
    AdminClubSchedule,
    AdminClubScheduleCalendarQuery,
    ClubSchedule,
    CreateClubScheduleRequest,
    UpdateClubScheduleRequest,
} from "@dongle/types/club/club.schedule";
import { captureServerException } from "@/lib/sentry/capture-server-exception";
import { revalidateTags } from "@/lib/server/revalidate-tags";
import { requireServerActionAccessToken } from "@/shared/action/server-action-auth";

interface ScheduleActionResult<T> {
    success: boolean;
    result?: T;
    error?: string;
}

function getActionErrorMessage(error: unknown, fallback: string): string {
    return error instanceof Error && error.message ? error.message : fallback;
}

function getServiceErrorMessage(error: { message?: string; detail?: string } | undefined, fallback: string) {
    return error?.detail || error?.message || fallback;
}

function revalidateScheduleTags(clubId?: number, scheduleId?: number) {
    if (typeof clubId === "number" && typeof scheduleId === "number") {
        revalidateTags(clubScheduleTagGroups.item(clubId, scheduleId));
        return;
    }

    if (typeof scheduleId === "number") {
        revalidateTags(clubScheduleTagGroups.adminItem(scheduleId));
        return;
    }

    if (typeof clubId === "number") {
        revalidateTags(clubScheduleTagGroups.club(clubId));
        return;
    }

    revalidateTags(clubScheduleTagGroups.list());
}

export async function createClubScheduleAction(
    clubId: number,
    payload: CreateClubScheduleRequest
): Promise<ScheduleActionResult<ClubSchedule>> {
    try {
        await requireServerActionAccessToken();

        const result = await createClubScheduleService(clubId, payload);
        revalidateScheduleTags(clubId, result.id);

        return { success: true, result };
    } catch (error) {
        captureServerException(error, "동아리 일정 생성 중 오류", {
            action: "createClubScheduleAction",
            clubId,
        });
        return {
            success: false,
            error: getActionErrorMessage(error, "일정 등록 중 오류가 발생했습니다. 다시 시도해주세요."),
        };
    }
}

export async function updateClubScheduleAction(
    clubId: number,
    scheduleId: number,
    payload: UpdateClubScheduleRequest
): Promise<ScheduleActionResult<ClubSchedule>> {
    try {
        await requireServerActionAccessToken();

        const result = await updateClubScheduleService(clubId, scheduleId, payload);
        revalidateScheduleTags(clubId, scheduleId);

        return { success: true, result };
    } catch (error) {
        captureServerException(error, "동아리 일정 수정 중 오류", {
            action: "updateClubScheduleAction",
            clubId,
            scheduleId,
        });
        return {
            success: false,
            error: getActionErrorMessage(error, "일정 수정 중 오류가 발생했습니다. 다시 시도해주세요."),
        };
    }
}

export async function deleteClubScheduleAction(
    clubId: number,
    scheduleId: number
): Promise<ScheduleActionResult<null>> {
    try {
        await requireServerActionAccessToken();

        const result = await deleteClubScheduleService(clubId, scheduleId);

        if (!result.isSuccess) {
            return {
                success: false,
                error: getServiceErrorMessage(result.error, "일정 삭제에 실패했습니다. 다시 시도해주세요."),
            };
        }

        revalidateScheduleTags(clubId, scheduleId);

        return { success: true, result: null };
    } catch (error) {
        captureServerException(error, "동아리 일정 삭제 중 오류", {
            action: "deleteClubScheduleAction",
            clubId,
            scheduleId,
        });
        return {
            success: false,
            error: getActionErrorMessage(error, "일정 삭제 중 오류가 발생했습니다. 다시 시도해주세요."),
        };
    }
}

export async function updateAdminClubScheduleStatusAction(
    scheduleId: number,
    isPublic: boolean
): Promise<ScheduleActionResult<AdminClubSchedule>> {
    try {
        await requireServerActionAccessToken();

        const result = await updateAdminClubScheduleStatusService(scheduleId, { is_public: isPublic });
        revalidateScheduleTags(undefined, scheduleId);

        return { success: true, result };
    } catch (error) {
        captureServerException(error, "관리자 일정 공개 상태 변경 중 오류", {
            action: "updateAdminClubScheduleStatusAction",
            scheduleId,
        });
        return {
            success: false,
            error: getActionErrorMessage(error, "공개 상태 변경 중 오류가 발생했습니다. 다시 시도해주세요."),
        };
    }
}

export async function deleteAdminClubScheduleAction(scheduleId: number): Promise<ScheduleActionResult<null>> {
    try {
        await requireServerActionAccessToken();

        const result = await deleteAdminClubScheduleService(scheduleId);

        if (!result.isSuccess) {
            return {
                success: false,
                error: getServiceErrorMessage(result.error, "일정 삭제에 실패했습니다. 다시 시도해주세요."),
            };
        }

        revalidateScheduleTags(undefined, scheduleId);

        return { success: true, result: null };
    } catch (error) {
        captureServerException(error, "관리자 일정 삭제 중 오류", {
            action: "deleteAdminClubScheduleAction",
            scheduleId,
        });
        return {
            success: false,
            error: getActionErrorMessage(error, "일정 삭제 중 오류가 발생했습니다. 다시 시도해주세요."),
        };
    }
}

export async function getAdminClubScheduleCalendarAction(
    query: AdminClubScheduleCalendarQuery
): Promise<ScheduleActionResult<AdminClubSchedule[]>> {
    try {
        await requireServerActionAccessToken();

        const result = await getAdminClubScheduleCalendarService(query);

        return { success: true, result };
    } catch (error) {
        captureServerException(error, "관리자 월간 일정 조회 중 오류", {
            action: "getAdminClubScheduleCalendarAction",
            query,
        });
        return {
            success: false,
            error: getActionErrorMessage(error, "월간 일정 조회 중 오류가 발생했습니다. 다시 시도해주세요."),
        };
    }
}

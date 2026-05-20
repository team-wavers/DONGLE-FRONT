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
} from "@dongle/types/club/club.schedule";
import { captureServerException } from "@/lib/sentry/capture-server-exception";
import { revalidateTags } from "@/lib/server/revalidate-tags";
import { actionFailure, actionSuccess, getZodFieldErrors, type ActionResult } from "@/shared/action";
import { requireServerActionAccessToken } from "@/shared/action/server-action-auth";
import {
    buildClubSchedulePayload,
    clubScheduleSchema,
    type ClubScheduleField,
    type ClubScheduleFormValues,
} from "../form/schedule-form.schema";

type ScheduleActionResult<TData = unknown> = ActionResult<ClubScheduleField, TData>;
type ScheduleMetaActionResult<TData = unknown> = ActionResult<string, TData>;

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
    values: ClubScheduleFormValues
): Promise<ScheduleActionResult<ClubSchedule>> {
    if (!Number.isFinite(clubId)) {
        return actionFailure({
            formError: "동아리 정보를 찾을 수 없습니다.",
        });
    }

    const parsed = clubScheduleSchema.safeParse(values);

    if (!parsed.success) {
        return actionFailure({
            fieldErrors: getZodFieldErrors<ClubScheduleField>(parsed.error),
            formError: "일정 정보를 다시 확인해주세요.",
        });
    }

    try {
        await requireServerActionAccessToken();

        const payload = buildClubSchedulePayload(parsed.data);
        const result = await createClubScheduleService(clubId, payload);
        revalidateScheduleTags(clubId, result.id);

        return actionSuccess({
            data: result,
            message: "일정이 등록되었습니다.",
        });
    } catch (error) {
        captureServerException(error, "동아리 일정 생성 중 오류", {
            action: "createClubScheduleAction",
            clubId,
        });
        return actionFailure({
            formError: getActionErrorMessage(error, "일정 등록 중 오류가 발생했습니다. 다시 시도해주세요."),
        });
    }
}

export async function updateClubScheduleAction(
    clubId: number,
    scheduleId: number,
    values: ClubScheduleFormValues
): Promise<ScheduleActionResult<ClubSchedule>> {
    if (!Number.isFinite(clubId) || !Number.isFinite(scheduleId)) {
        return actionFailure({
            formError: "일정 정보를 찾을 수 없습니다.",
        });
    }

    const parsed = clubScheduleSchema.safeParse(values);

    if (!parsed.success) {
        return actionFailure({
            fieldErrors: getZodFieldErrors<ClubScheduleField>(parsed.error),
            formError: "일정 정보를 다시 확인해주세요.",
        });
    }

    try {
        await requireServerActionAccessToken();

        const payload = buildClubSchedulePayload(parsed.data);
        const result = await updateClubScheduleService(clubId, scheduleId, payload);
        revalidateScheduleTags(clubId, scheduleId);

        return actionSuccess({
            data: result,
            message: "일정이 수정되었습니다.",
        });
    } catch (error) {
        captureServerException(error, "동아리 일정 수정 중 오류", {
            action: "updateClubScheduleAction",
            clubId,
            scheduleId,
        });
        return actionFailure({
            formError: getActionErrorMessage(error, "일정 수정 중 오류가 발생했습니다. 다시 시도해주세요."),
        });
    }
}

export async function deleteClubScheduleAction(
    clubId: number,
    scheduleId: number
): Promise<ScheduleMetaActionResult<null>> {
    if (!Number.isFinite(clubId) || !Number.isFinite(scheduleId)) {
        return actionFailure({
            formError: "일정 정보를 찾을 수 없습니다.",
        });
    }

    try {
        await requireServerActionAccessToken();

        const result = await deleteClubScheduleService(clubId, scheduleId);

        if (!result.isSuccess) {
            return actionFailure({
                formError: getServiceErrorMessage(result.error, "일정 삭제에 실패했습니다. 다시 시도해주세요."),
            });
        }

        revalidateScheduleTags(clubId, scheduleId);

        return actionSuccess({
            data: null,
            message: "일정이 삭제되었습니다.",
        });
    } catch (error) {
        captureServerException(error, "동아리 일정 삭제 중 오류", {
            action: "deleteClubScheduleAction",
            clubId,
            scheduleId,
        });
        return actionFailure({
            formError: getActionErrorMessage(error, "일정 삭제 중 오류가 발생했습니다. 다시 시도해주세요."),
        });
    }
}

export async function updateAdminClubScheduleStatusAction(
    scheduleId: number,
    isPublic: boolean
): Promise<ScheduleMetaActionResult<AdminClubSchedule>> {
    if (!Number.isFinite(scheduleId)) {
        return actionFailure({
            formError: "일정 정보를 찾을 수 없습니다.",
        });
    }

    try {
        await requireServerActionAccessToken();

        const result = await updateAdminClubScheduleStatusService(scheduleId, { is_public: isPublic });
        revalidateScheduleTags(undefined, scheduleId);

        return actionSuccess({
            data: result,
        });
    } catch (error) {
        captureServerException(error, "관리자 일정 공개 상태 변경 중 오류", {
            action: "updateAdminClubScheduleStatusAction",
            scheduleId,
        });
        return actionFailure({
            formError: getActionErrorMessage(error, "공개 상태 변경 중 오류가 발생했습니다. 다시 시도해주세요."),
        });
    }
}

export async function deleteAdminClubScheduleAction(scheduleId: number): Promise<ScheduleMetaActionResult<null>> {
    if (!Number.isFinite(scheduleId)) {
        return actionFailure({
            formError: "일정 정보를 찾을 수 없습니다.",
        });
    }

    try {
        await requireServerActionAccessToken();

        const result = await deleteAdminClubScheduleService(scheduleId);

        if (!result.isSuccess) {
            return actionFailure({
                formError: getServiceErrorMessage(result.error, "일정 삭제에 실패했습니다. 다시 시도해주세요."),
            });
        }

        revalidateScheduleTags(undefined, scheduleId);

        return actionSuccess({
            data: null,
            message: "일정이 삭제되었습니다.",
        });
    } catch (error) {
        captureServerException(error, "관리자 일정 삭제 중 오류", {
            action: "deleteAdminClubScheduleAction",
            scheduleId,
        });
        return actionFailure({
            formError: getActionErrorMessage(error, "일정 삭제 중 오류가 발생했습니다. 다시 시도해주세요."),
        });
    }
}

export async function getAdminClubScheduleCalendarAction(
    query: AdminClubScheduleCalendarQuery
): Promise<ScheduleMetaActionResult<AdminClubSchedule[]>> {
    try {
        await requireServerActionAccessToken();

        const result = await getAdminClubScheduleCalendarService(query);

        return actionSuccess({
            data: result,
        });
    } catch (error) {
        captureServerException(error, "관리자 월간 일정 조회 중 오류", {
            action: "getAdminClubScheduleCalendarAction",
            query,
        });
        return actionFailure({
            formError: getActionErrorMessage(error, "월간 일정 조회 중 오류가 발생했습니다. 다시 시도해주세요."),
        });
    }
}

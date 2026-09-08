"use server";

import {
    clubScheduleTagGroups,
    createAdminCommonClubScheduleService,
    createClubScheduleService,
    deleteAdminClubScheduleService,
    deleteClubScheduleService,
    getAdminClubScheduleCalendarService,
    getAdminClubScheduleService,
    updateAdminClubScheduleService,
    updateAdminClubScheduleStatusService,
    updateClubScheduleService,
} from "@dongle/service";
import type { Response } from "@dongle/types/response";
import type {
    AdminClubSchedule,
    AdminClubScheduleCalendarQuery,
    ClubSchedule,
} from "@dongle/types/club/club.schedule";
import { captureServerException } from "@/lib/sentry/capture-server-exception";
import { revalidateTags } from "@/lib/server/revalidate-tags";
import { actionFailure, actionSuccess, getActionErrorMessage, getServiceErrorMessage, getZodFieldErrors, type ActionResult } from "@/shared/action";
import { requireServerActionAccessToken } from "@/shared/action/server-action-auth";
import { getSessionExpiredActionFailure } from "@/shared/action";
import { AUTH_ROLE } from "@dongle/types/auth/auth-role";
import {
    buildClubSchedulePayload,
    clubScheduleSchema,
    type ClubScheduleField,
    type ClubScheduleFormValues,
} from "../form/schedule-form.schema";

type ScheduleActionResult<TData = unknown> = ActionResult<ClubScheduleField, TData>;
type ScheduleMetaActionResult<TData = unknown> = ActionResult<string, TData>;

function revalidateScheduleTags(clubId?: number | null, scheduleId?: number) {
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

function unwrapScheduleResponse<T>(response: Response<T>, fallbackMessage: string): T {
    if (!response.isSuccess) {
        const error = new Error(getServiceErrorMessage(response.error, fallbackMessage));
        if (typeof response.error.status === "number") {
            Object.assign(error, { status: response.error.status });
        }
        throw error;
    }

    return response.result;
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
        await requireServerActionAccessToken({ clubId });

        const payload = buildClubSchedulePayload(parsed.data);
        const result = unwrapScheduleResponse(
            await createClubScheduleService(clubId, payload),
            "일정 등록에 실패했습니다. 다시 시도해주세요."
        );
        revalidateScheduleTags(clubId, result.id);

        return actionSuccess({
            data: result,
            message: "일정이 등록되었습니다.",
        });
    } catch (error) {
        const expired = getSessionExpiredActionFailure(error);
        if (expired) return actionFailure(expired);
        captureServerException(error, "동아리 일정 생성 중 오류", {
            action: "createClubScheduleAction",
            clubId,
        });
        return actionFailure({
            formError: getActionErrorMessage(error, "일정 등록 중 오류가 발생했습니다. 다시 시도해주세요."),
        });
    }
}

export async function createAdminCommonClubScheduleAction(
    values: ClubScheduleFormValues
): Promise<ScheduleActionResult<AdminClubSchedule>> {
    const parsed = clubScheduleSchema.safeParse(values);

    if (!parsed.success) {
        return actionFailure({
            fieldErrors: getZodFieldErrors<ClubScheduleField>(parsed.error),
            formError: "일정 정보를 다시 확인해주세요.",
        });
    }

    try {
        await requireServerActionAccessToken({ role: AUTH_ROLE.ADMIN });

        const payload = buildClubSchedulePayload(parsed.data);
        const result = unwrapScheduleResponse(
            await createAdminCommonClubScheduleService(payload),
            "공통 일정 등록에 실패했습니다. 다시 시도해주세요."
        );
        revalidateScheduleTags(result.club_id, result.id);

        return actionSuccess({
            data: result,
            message: "공통 일정이 등록되었습니다.",
        });
    } catch (error) {
        const expired = getSessionExpiredActionFailure(error);
        if (expired) return actionFailure(expired);
        captureServerException(error, "관리자 공통 일정 생성 중 오류", {
            action: "createAdminCommonClubScheduleAction",
        });
        return actionFailure({
            formError: getActionErrorMessage(error, "공통 일정 등록 중 오류가 발생했습니다. 다시 시도해주세요."),
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
        await requireServerActionAccessToken({ clubId });

        const payload = buildClubSchedulePayload(parsed.data);
        const result = unwrapScheduleResponse(
            await updateClubScheduleService(clubId, scheduleId, payload),
            "일정 수정에 실패했습니다. 다시 시도해주세요."
        );
        revalidateScheduleTags(clubId, scheduleId);

        return actionSuccess({
            data: result,
            message: "일정이 수정되었습니다.",
        });
    } catch (error) {
        const expired = getSessionExpiredActionFailure(error);
        if (expired) return actionFailure(expired);
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

export async function updateAdminClubScheduleAction(
    scheduleId: number,
    values: ClubScheduleFormValues
): Promise<ScheduleActionResult<AdminClubSchedule>> {
    if (!Number.isFinite(scheduleId)) {
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
        await requireServerActionAccessToken({ role: AUTH_ROLE.ADMIN });

        const payload = buildClubSchedulePayload(parsed.data);
        const result = unwrapScheduleResponse(
            await updateAdminClubScheduleService(scheduleId, payload),
            "일정 수정에 실패했습니다. 다시 시도해주세요."
        );
        revalidateScheduleTags(result.club_id, scheduleId);

        return actionSuccess({
            data: result,
            message: result.club_id === null ? "공통 일정이 수정되었습니다." : "일정이 수정되었습니다.",
        });
    } catch (error) {
        const expired = getSessionExpiredActionFailure(error);
        if (expired) return actionFailure(expired);
        captureServerException(error, "관리자 일정 수정 중 오류", {
            action: "updateAdminClubScheduleAction",
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
        await requireServerActionAccessToken({ clubId });

        const result = await deleteClubScheduleService(clubId, scheduleId);

        if (!result.isSuccess) {
            const expired = getSessionExpiredActionFailure(result.error);
            if (expired) return actionFailure(expired);
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
        const expired = getSessionExpiredActionFailure(error);
        if (expired) return actionFailure(expired);
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
        await requireServerActionAccessToken({ role: AUTH_ROLE.ADMIN });

        const result = unwrapScheduleResponse(
            await updateAdminClubScheduleStatusService(scheduleId, { is_public: isPublic }),
            "공개 상태 변경에 실패했습니다. 다시 시도해주세요."
        );
        revalidateScheduleTags(result.club_id, scheduleId);

        return actionSuccess({
            data: result,
        });
    } catch (error) {
        const expired = getSessionExpiredActionFailure(error);
        if (expired) return actionFailure(expired);
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
        await requireServerActionAccessToken({ role: AUTH_ROLE.ADMIN });

        const schedule = unwrapScheduleResponse(
            await getAdminClubScheduleService(scheduleId),
            "일정 정보를 불러오지 못했습니다."
        );
        const result = await deleteAdminClubScheduleService(scheduleId);

        if (!result.isSuccess) {
            const expired = getSessionExpiredActionFailure(result.error);
            if (expired) return actionFailure(expired);
            return actionFailure({
                formError: getServiceErrorMessage(result.error, "일정 삭제에 실패했습니다. 다시 시도해주세요."),
            });
        }

        revalidateScheduleTags(schedule.club_id, scheduleId);

        return actionSuccess({
            data: null,
            message: "일정이 삭제되었습니다.",
        });
    } catch (error) {
        const expired = getSessionExpiredActionFailure(error);
        if (expired) return actionFailure(expired);
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
        await requireServerActionAccessToken({ role: AUTH_ROLE.ADMIN });

        const result = unwrapScheduleResponse(
            await getAdminClubScheduleCalendarService(query),
            "월간 일정 조회에 실패했습니다. 다시 시도해주세요."
        );

        return actionSuccess({
            data: result,
        });
    } catch (error) {
        const expired = getSessionExpiredActionFailure(error);
        if (expired) return actionFailure(expired);
        captureServerException(error, "관리자 월간 일정 조회 중 오류", {
            action: "getAdminClubScheduleCalendarAction",
            query,
        });
        return actionFailure({
            formError: getActionErrorMessage(error, "월간 일정 조회 중 오류가 발생했습니다. 다시 시도해주세요."),
        });
    }
}

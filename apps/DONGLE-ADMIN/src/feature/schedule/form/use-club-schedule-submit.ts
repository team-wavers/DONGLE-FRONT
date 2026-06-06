"use client";

import { useState } from "react";
import type { SubmitErrorHandler, SubmitHandler, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import type { AdminClubSchedule, ClubSchedule as ApiClubSchedule } from "@dongle/types/club/club.schedule";
import { applyServerFieldErrors } from "@/shared/form/server-errors";
import {
    createAdminCommonClubScheduleAction,
    createClubScheduleAction,
    updateAdminClubScheduleAction,
    updateClubScheduleAction,
} from "../action/schedule.action";
import type { ClubScheduleFormValues } from "./schedule-form.schema";

export function submitClubScheduleValues({
    clubId,
    scheduleId,
    values,
}: {
    clubId: number | null;
    scheduleId?: number;
    values: ClubScheduleFormValues;
}) {
    if (clubId === null) {
        return scheduleId === undefined
            ? createAdminCommonClubScheduleAction(values)
            : updateAdminClubScheduleAction(scheduleId, values);
    }

    return scheduleId === undefined
        ? createClubScheduleAction(clubId, values)
        : updateClubScheduleAction(clubId, scheduleId, values);
}

export function useClubScheduleSubmit({
    form,
    clubId,
    scheduleId,
    onSuccess,
}: {
    form: UseFormReturn<ClubScheduleFormValues>;
    clubId: number | null;
    scheduleId?: number;
    onSuccess: (schedule: ApiClubSchedule | AdminClubSchedule) => void;
}) {
    const [formError, setFormError] = useState<string | undefined>(undefined);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmit: SubmitHandler<ClubScheduleFormValues> = async (values) => {
        setIsSubmitting(true);
        setFormError(undefined);

        try {
            const result = await submitClubScheduleValues({ clubId, scheduleId, values });

            if (!result.ok) {
                applyServerFieldErrors(form, result.fieldErrors);
                setFormError(result.formError);

                if (result.formError) {
                    toast.error(result.formError);
                }

                return;
            }

            if (result.data) {
                toast.success(
                    result.message ?? (scheduleId === undefined ? "일정이 등록되었습니다." : "일정이 수정되었습니다.")
                );
                onSuccess(result.data);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const onInvalid: SubmitErrorHandler<ClubScheduleFormValues> = () => {
        toast.error("일정 정보를 다시 확인해주세요.");
    };

    return {
        formError,
        isSubmitting,
        onSubmit,
        onInvalid,
    };
}

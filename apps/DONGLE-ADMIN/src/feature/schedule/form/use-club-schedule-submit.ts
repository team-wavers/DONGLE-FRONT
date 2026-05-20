"use client";

import { useState } from "react";
import type { SubmitErrorHandler, SubmitHandler, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import type { ClubSchedule as ApiClubSchedule } from "@dongle/types/club/club.schedule";
import { applyServerFieldErrors } from "@/shared/form";
import { createClubScheduleAction, updateClubScheduleAction } from "../action/schedule.action";
import type { ClubScheduleFormValues } from "./schedule-form.schema";

export function useClubScheduleSubmit({
    form,
    clubId,
    scheduleId,
    onSuccess,
}: {
    form: UseFormReturn<ClubScheduleFormValues>;
    clubId: number;
    scheduleId?: number;
    onSuccess: (schedule: ApiClubSchedule) => void;
}) {
    const [formError, setFormError] = useState<string | undefined>(undefined);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmit: SubmitHandler<ClubScheduleFormValues> = async (values) => {
        setIsSubmitting(true);
        setFormError(undefined);

        try {
            const result =
                scheduleId === undefined
                    ? await createClubScheduleAction(clubId, values)
                    : await updateClubScheduleAction(clubId, scheduleId, values);

            if (!result.ok) {
                applyServerFieldErrors(form, result.fieldErrors);
                setFormError(result.formError);

                if (result.formError) {
                    toast.error(result.formError);
                }

                return;
            }

            if (result.data) {
                toast.success(result.message ?? (scheduleId === undefined ? "일정이 등록되었습니다." : "일정이 수정되었습니다."));
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

"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { AdminClubSchedule, ClubSchedule as ApiClubSchedule } from "@dongle/types/club/club.schedule";
import { useActionFormSubmit } from "@/shared/form/use-action-form-submit";
import {
    createAdminCommonClubScheduleAction,
    createClubScheduleAction,
    updateAdminClubScheduleAction,
    updateClubScheduleAction,
} from "../action/schedule.action";
import type { ClubSchedule } from "../schedule.types";
import { clubScheduleSchema, createClubScheduleDefaultValues, type ClubScheduleFormValues } from "./schedule-form.schema";

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

export function useClubScheduleForm({
    clubId,
    open,
    schedule,
    onOpenChange,
    onSuccess,
}: {
    clubId: number | null;
    open: boolean;
    schedule: ClubSchedule | null;
    onOpenChange: (open: boolean) => void;
    onSuccess: (schedule: ApiClubSchedule | AdminClubSchedule) => void;
}) {
    const [lastOpenSchedule, setLastOpenSchedule] = useState<ClubSchedule | null>(schedule);
    const visibleSchedule = getScheduleDialogVisibleSchedule(open, schedule, lastOpenSchedule);
    const scheduleId = schedule?.id;
    const form = useForm<ClubScheduleFormValues>({
        resolver: zodResolver(clubScheduleSchema),
        defaultValues: createClubScheduleDefaultValues(schedule),
        mode: "onSubmit",
    });

    const submit = useActionFormSubmit({
        form,
        invalidMessage: "일정 정보를 다시 확인해주세요.",
        action: (values) => submitClubScheduleValues({ clubId, scheduleId, values }),
        onSuccess: ({ result }) => {
            if (result.data) {
                toast.success(
                    result.message ?? (scheduleId === undefined ? "일정이 등록되었습니다." : "일정이 수정되었습니다.")
                );
                onSuccess(result.data);
            }
        },
    });

    useEffect(() => {
        if (open) {
            setLastOpenSchedule(schedule);
            form.reset(createClubScheduleDefaultValues(schedule));
        }
    }, [form, open, schedule]);

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen && submit.isSubmitting) {
            return;
        }

        onOpenChange(nextOpen);
    };

    return {
        form,
        visibleSchedule,
        isEditMode: visibleSchedule !== null,
        handleOpenChange,
        ...submit,
    };
}

export function getScheduleDialogVisibleSchedule<TSchedule>(
    open: boolean,
    schedule: TSchedule | null,
    lastOpenSchedule: TSchedule | null
) {
    return open ? schedule : lastOpenSchedule;
}

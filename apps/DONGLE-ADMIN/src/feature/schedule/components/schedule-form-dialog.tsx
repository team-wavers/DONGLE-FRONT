"use client";

import { LoadingButton } from "@/shared/ui/feedback/button/loading-button/loading-button";
import { FormTextarea } from "@/shared/ui/form/form-textarea/form-textarea";
import { AdminFormActions } from "@/shared/layout/form-page/admin-form-layout";
import { FormRoot } from "@/shared/form/form-root";
import { RHFDatePicker } from "@/shared/form/rhf-date-picker";
import { RHFSelectField } from "@/shared/form/rhf-select-field";
import { RHFTextField } from "@/shared/form/rhf-text-field";
import type { AdminClubSchedule, ClubSchedule as ApiClubSchedule } from "@dongle/types/club/club.schedule";
import { Button } from "@dongle/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@dongle/ui/dialog";
import { Label } from "@dongle/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@dongle/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
    clubScheduleSchema,
    createClubScheduleDefaultValues,
    type ClubScheduleFormValues,
} from "../form/schedule-form.schema";
import { useClubScheduleSubmit } from "../form/use-club-schedule-submit";
import type { ClubSchedule, ScheduleType } from "../schedule.types";
import { SCHEDULE_TYPE_LABELS } from "../schedule.types";

interface ScheduleFormDialogProps {
    clubId: number | null;
    open: boolean;
    schedule: ClubSchedule | null;
    onOpenChange: (open: boolean) => void;
    onSuccess: (schedule: ApiClubSchedule | AdminClubSchedule) => void;
}

function RequiredMark() {
    return <span className="text-destructive">*</span>;
}

const scheduleTypeOptions = Object.entries(SCHEDULE_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
})) as Array<{ value: ScheduleType; label: string }>;

export function getScheduleDialogVisibleSchedule<TSchedule>(
    open: boolean,
    schedule: TSchedule | null,
    lastOpenSchedule: TSchedule | null
) {
    return open ? schedule : lastOpenSchedule;
}

export function ScheduleFormDialog({ clubId, open, schedule, onOpenChange, onSuccess }: ScheduleFormDialogProps) {
    const isCommonSchedule = clubId === null;
    const [lastOpenSchedule, setLastOpenSchedule] = useState<ClubSchedule | null>(schedule);
    const visibleSchedule = getScheduleDialogVisibleSchedule(open, schedule, lastOpenSchedule);
    const isEditMode = visibleSchedule !== null;
    const dialogTitle = isEditMode
        ? isCommonSchedule
            ? "공통 일정 수정"
            : "일정 수정"
        : isCommonSchedule
          ? "일정 등록"
          : "일정 등록";
    const submitLabel = isEditMode ? "수정" : "등록";
    const form = useForm<ClubScheduleFormValues>({
        resolver: zodResolver(clubScheduleSchema),
        defaultValues: createClubScheduleDefaultValues(schedule),
        mode: "onSubmit",
    });
    const { formError, isSubmitting, onSubmit, onInvalid } = useClubScheduleSubmit({
        form,
        clubId,
        scheduleId: schedule?.id,
        onSuccess,
    });

    useEffect(() => {
        if (open) {
            setLastOpenSchedule(schedule);
            form.reset(createClubScheduleDefaultValues(schedule));
        }
    }, [form, open, schedule]);

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen && isSubmitting) {
            return;
        }

        onOpenChange(nextOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent
                className="max-h-[85vh] gap-0 overflow-hidden p-0 data-[state=closed]:hidden data-[state=closed]:animate-none data-[state=closed]:duration-0 sm:max-w-2xl"
                onInteractOutside={(event) => event.preventDefault()}>
                <DialogHeader className="border-b px-6 py-5">
                    <DialogTitle>{dialogTitle}</DialogTitle>
                    <DialogDescription>
                        {isCommonSchedule
                            ? "공개 공통 일정은 사용자 전체 일정 캘린더에 노출됩니다."
                            : "공개 일정은 사용자 동아리 상세에 노출됩니다."}
                    </DialogDescription>
                </DialogHeader>

                <FormRoot
                    form={form}
                    onSubmit={onSubmit}
                    onInvalid={onInvalid}
                    formError={formError}
                    className="flex max-h-[calc(85vh-5rem)] flex-col">
                    <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
                        <RHFTextField<ClubScheduleFormValues>
                            id="schedule-title"
                            name="title"
                            label="일정 제목"
                            placeholder="신입 부원 오리엔테이션"
                            required
                        />

                        <div className="grid gap-4 md:grid-cols-2">
                            <RHFSelectField<ClubScheduleFormValues>
                                id="schedule-type"
                                name="type"
                                label="일정 유형"
                                placeholder="유형 선택"
                                required
                                options={scheduleTypeOptions}
                            />

                            <Controller
                                control={form.control}
                                name="isPublic"
                                render={({ field, fieldState }) => (
                                    <div className="flex flex-col gap-2">
                                        <Label>
                                            공개 여부 <RequiredMark />
                                        </Label>
                                        <Select
                                            value={field.value ? "true" : "false"}
                                            onValueChange={(value) => field.onChange(value === "true")}>
                                            <SelectTrigger className="h-11 w-full rounded-xl bg-white">
                                                <SelectValue placeholder="공개 여부" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="true">공개</SelectItem>
                                                <SelectItem value="false">비공개</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error?.message ? (
                                            <p className="text-sm text-red-500">{fieldState.error.message}</p>
                                        ) : null}
                                    </div>
                                )}
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <RHFDatePicker<ClubScheduleFormValues>
                                id="schedule-starts-at"
                                name="startsAt"
                                label="시작일시"
                                includeTime
                                required
                                triggerClassName="w-full"
                            />
                            <RHFDatePicker<ClubScheduleFormValues>
                                id="schedule-ends-at"
                                name="endsAt"
                                label="종료일시"
                                includeTime
                                required
                                triggerClassName="w-full"
                            />
                        </div>

                        <div className="rounded-lg border border-sky-100 bg-sky-50 px-4 py-3 text-sm leading-6 text-sky-800">
                            사용자 화면에서는 시작/종료 시간이 00시 00분이면 시간을 표시하지 않고 날짜만 보여줍니다.
                        </div>

                        <RHFTextField<ClubScheduleFormValues>
                            id="schedule-location"
                            name="location"
                            label="장소"
                            placeholder="학생회관 302호"
                        />

                        <Controller
                            control={form.control}
                            name="description"
                            render={({ field, fieldState }) => (
                                <FormTextarea
                                    id="schedule-description"
                                    label="설명"
                                    value={field.value ?? ""}
                                    onChange={field.onChange}
                                    placeholder="사용자에게 보여줄 일정 설명을 입력하세요."
                                    className="min-h-28 rounded-xl"
                                    rows={4}
                                    error={fieldState.error?.message}
                                />
                            )}
                        />

                        <RHFTextField<ClubScheduleFormValues>
                            id="schedule-external-url"
                            name="externalUrl"
                            label="외부 링크"
                            placeholder="https://example.com"
                        />
                    </div>

                    <AdminFormActions className="sticky bottom-0 px-6 py-4">
                        <Button type="button" size="lg" variant="outline" onClick={() => handleOpenChange(false)}>
                            취소
                        </Button>
                        <LoadingButton size="lg" type="submit" loading={isSubmitting} loadingText="저장 중">
                            {submitLabel}
                        </LoadingButton>
                    </AdminFormActions>
                </FormRoot>
            </DialogContent>
        </Dialog>
    );
}

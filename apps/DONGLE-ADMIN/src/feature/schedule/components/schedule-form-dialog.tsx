"use client";

import { LoadingButton } from "@/components/atoms/button/loading-button/loading-button";
import { FormTextarea } from "@/components/atoms/form/form-textarea/form-textarea";
import { FormRoot, RHFDatePicker, RHFSelectField, RHFTextField } from "@/shared/form";
import type { ClubSchedule as ApiClubSchedule } from "@dongle/types/club/club.schedule";
import { Button } from "@dongle/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@dongle/ui/dialog";
import { Label } from "@dongle/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@dongle/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
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
    clubId: number;
    open: boolean;
    schedule: ClubSchedule | null;
    onOpenChange: (open: boolean) => void;
    onSuccess: (schedule: ApiClubSchedule) => void;
}

function RequiredMark() {
    return <span className="text-destructive">*</span>;
}

const scheduleTypeOptions = Object.entries(SCHEDULE_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
})) as Array<{ value: ScheduleType; label: string }>;

export function ScheduleFormDialog({ clubId, open, schedule, onOpenChange, onSuccess }: ScheduleFormDialogProps) {
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
                className="max-h-[85vh] gap-0 overflow-hidden p-0 sm:max-w-2xl"
                onInteractOutside={(event) => event.preventDefault()}>
                <DialogHeader className="border-b px-6 py-5">
                    <DialogTitle>{schedule ? "일정 수정" : "일정 등록"}</DialogTitle>
                    <DialogDescription>공개 일정은 사용자 동아리 상세에 노출됩니다.</DialogDescription>
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

                    <DialogFooter className="sticky bottom-0 gap-2 border-t bg-white px-6 py-4">
                        <Button type="button" size="lg" variant="outline" onClick={() => handleOpenChange(false)}>
                            취소
                        </Button>
                        <LoadingButton size="lg" type="submit" loading={isSubmitting} loadingText="저장 중">
                            {schedule ? "수정" : "등록"}
                        </LoadingButton>
                    </DialogFooter>
                </FormRoot>
            </DialogContent>
        </Dialog>
    );
}

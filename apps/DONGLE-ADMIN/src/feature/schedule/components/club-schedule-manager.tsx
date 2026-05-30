"use client";

import { useCurrentTime } from "@/hooks/use-current-time";
import { Button } from "@dongle/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@dongle/ui/dialog";
import { Input } from "@dongle/ui/input";
import {
    ScheduleDisplayMonthList,
    ScheduleDisplaySection,
} from "@dongle/ui/schedules/schedule-display-list";
import {
    groupScheduleDisplayItemsByMonth,
    type ScheduleDisplayItem,
    type ScheduleDisplayMonthGroup,
} from "@dongle/ui/schedules/schedule-display";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@dongle/ui/select";
import { CalendarPlus, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { deleteClubScheduleAction } from "../action/schedule.action";
import type { ClubSchedule } from "../schedule.types";
import {
    filterSchedules,
    getSeparatedScheduleGroups,
    getScheduleDateRangeFilter,
    mapClubScheduleToClubSchedule,
} from "../schedule.utils";
import type { ScheduleDateFilter } from "../schedule.utils";
import { mapScheduleToDisplayItem } from "./schedule-display.mapper";
import { ScheduleFormDialog } from "./schedule-form-dialog";

interface ClubScheduleManagerProps {
    clubId: string;
    initialSchedules: ClubSchedule[];
}

type PublicFilter = "all" | "public" | "private";

const publicFilterOptions = [
    ["all", "전체 공개여부"],
    ["public", "공개"],
    ["private", "비공개"],
] as const satisfies ReadonlyArray<readonly [PublicFilter, string]>;

const dateFilterOptions = [
    ["all", "전체 기간"],
    ["today", "오늘"],
    ["thisWeek", "이번 주"],
    ["thisMonth", "이번 달"],
    ["custom", "직접 선택"],
] as const satisfies ReadonlyArray<readonly [ScheduleDateFilter, string]>;

export default function ClubScheduleManager({ clubId, initialSchedules }: ClubScheduleManagerProps) {
    const [schedules, setSchedules] = useState(initialSchedules);
    const [publicFilter, setPublicFilter] = useState<PublicFilter>("all");
    const [dateFilter, setDateFilter] = useState<ScheduleDateFilter>("all");
    const [customDateFrom, setCustomDateFrom] = useState("");
    const [customDateTo, setCustomDateTo] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<ClubSchedule | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<ClubSchedule | null>(null);
    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
    const now = useCurrentTime();
    const clubIdNumber = Number(clubId);

    const dateRange = useMemo(
        () => getScheduleDateRangeFilter(dateFilter, now, { from: customDateFrom, to: customDateTo }),
        [customDateFrom, customDateTo, dateFilter, now]
    );
    const filteredSchedules = useMemo(
        () =>
            filterSchedules(schedules, {
                keyword: "",
                category: "all",
                type: "all",
                isPublic: publicFilter === "all" ? "all" : publicFilter === "public",
                status: "all",
                now,
                dateRange,
            }),
        [dateRange, now, publicFilter, schedules]
    );
    const separatedSchedules = useMemo(() => getSeparatedScheduleGroups(filteredSchedules, now), [filteredSchedules, now]);
    const ongoingScheduleItems = useMemo(
        () => separatedSchedules.ongoing.map(mapScheduleToDisplayItem),
        [separatedSchedules.ongoing]
    );
    const displayScheduleGroups = useMemo<ScheduleDisplayMonthGroup<ClubSchedule>[]>(
        () => groupScheduleDisplayItemsByMonth(separatedSchedules.remaining.map(mapScheduleToDisplayItem)),
        [separatedSchedules.remaining]
    );
    const isCustomDateFilter = dateFilter === "custom";
    const hasActiveFilter = Boolean(publicFilter !== "all" || dateFilter !== "all" || customDateFrom || customDateTo);

    const resetFilters = useCallback(() => {
        setPublicFilter("all");
        setDateFilter("all");
        setCustomDateFrom("");
        setCustomDateTo("");
    }, []);

    const changeDateFilter = useCallback((value: string) => {
        const nextDateFilter = value as ScheduleDateFilter;
        setDateFilter(nextDateFilter);

        if (nextDateFilter !== "custom") {
            setCustomDateFrom("");
            setCustomDateTo("");
        }
    }, []);

    const startCreate = useCallback(() => {
        setEditingSchedule(null);
        setIsFormOpen(true);
    }, []);

    const startEdit = useCallback((schedule: ClubSchedule) => {
        setEditingSchedule(schedule);
        setIsFormOpen(true);
    }, []);

    const renderScheduleActions = useCallback(
        (item: ScheduleDisplayItem<ClubSchedule>) => {
            const schedule = item.payload;

            if (!schedule) {
                return null;
            }

            return (
                <>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        disabled={pendingDeleteId === schedule.id}
                        onClick={() => startEdit(schedule)}
                        className="cursor-pointer"
                        aria-label={`${schedule.title} 수정`}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={pendingDeleteId === schedule.id}
                        onClick={() => setDeleteTarget(schedule)}
                        className="cursor-pointer"
                        aria-label={`${schedule.title} 삭제`}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </>
            );
        },
        [pendingDeleteId, startEdit]
    );

    const closeForm = useCallback(() => {
        setIsFormOpen(false);
        setEditingSchedule(null);
    }, []);

    const deleteSchedule = async (id: number) => {
        setPendingDeleteId(id);
        const result = await deleteClubScheduleAction(clubIdNumber, id);
        setPendingDeleteId(null);

        if (!result.ok) {
            toast.error(result.formError ?? "일정 삭제 중 오류가 발생했습니다. 다시 시도해주세요.");
            return;
        }

        setSchedules((current) => current.filter((schedule) => schedule.id !== id));
        toast.success(result.message ?? "일정이 삭제되었습니다.");
        setDeleteTarget(null);
        if (editingSchedule?.id === id) {
            closeForm();
        }
    };

    return (
        <div className="grid w-full gap-6">
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">일정 관리</h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            공개 일정은 사용자 동아리 상세에 노출됩니다.
                        </p>
                    </div>
                    <Button onClick={startCreate} className="h-11 cursor-pointer font-semibold">
                        <CalendarPlus className="h-4 w-4" />
                        일정 등록
                    </Button>
                </div>

                <div className="grid gap-3 border-b border-zinc-100 pb-3 md:grid-cols-[minmax(0,180px)_minmax(0,180px)_minmax(0,1fr)] md:items-center">
                    <Select value={publicFilter} onValueChange={(value) => setPublicFilter(value as PublicFilter)}>
                        <SelectTrigger className="h-11 w-full rounded-xl bg-white" aria-label="공개여부 필터">
                            <SelectValue placeholder="공개여부" />
                        </SelectTrigger>
                        <SelectContent>
                            {publicFilterOptions.map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                    {label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={dateFilter} onValueChange={changeDateFilter}>
                        <SelectTrigger className="h-11 w-full rounded-xl bg-white" aria-label="Date 필터">
                            <SelectValue placeholder="Date" />
                        </SelectTrigger>
                        <SelectContent>
                            {dateFilterOptions.map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                    {label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        {isCustomDateFilter ? (
                            <>
                                <Input
                                    type="date"
                                    value={customDateFrom}
                                    max={customDateTo || undefined}
                                    onChange={(event) => setCustomDateFrom(event.target.value)}
                                    className="h-11 rounded-xl bg-white"
                                    aria-label="시작일"
                                />
                                <Input
                                    type="date"
                                    value={customDateTo}
                                    min={customDateFrom || undefined}
                                    onChange={(event) => setCustomDateTo(event.target.value)}
                                    className="h-11 rounded-xl bg-white"
                                    aria-label="종료일"
                                />
                            </>
                        ) : null}
                        {hasActiveFilter ? (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={resetFilters}
                                className="h-9 shrink-0 cursor-pointer rounded-xl px-4">
                                <RotateCcw className="h-4 w-4" />
                                초기화
                            </Button>
                        ) : null}
                    </div>
                </div>

                {filteredSchedules.length === 0 ? (
                    <div className="rounded-lg border bg-white py-16 text-center text-sm text-muted-foreground">
                        조건에 맞는 일정이 없습니다.
                    </div>
                ) : (
                    <div className="space-y-6">
                        <ScheduleDisplaySection
                            title="진행 중인 일정"
                            items={ongoingScheduleItems}
                            showPublicBadge
                            variant="active"
                            renderActions={renderScheduleActions}
                        />
                        <ScheduleDisplayMonthList
                            groups={displayScheduleGroups}
                            showPublicBadge
                            renderActions={renderScheduleActions}
                        />
                    </div>
                )}
            </div>

            <ScheduleFormDialog
                clubId={clubIdNumber}
                open={isFormOpen}
                schedule={editingSchedule}
                onOpenChange={(open) => {
                    if (!open) {
                        closeForm();
                        return;
                    }

                    setIsFormOpen(true);
                }}
                onSuccess={(schedule) => {
                    const nextSchedule = mapClubScheduleToClubSchedule(schedule, editingSchedule ?? undefined);
                    setSchedules((current) => {
                        if (editingSchedule) {
                            return current.map((item) => (item.id === nextSchedule.id ? nextSchedule : item));
                        }

                        return [...current, nextSchedule];
                    });
                    closeForm();
                }}
            />

            <Dialog
                open={deleteTarget !== null}
                onOpenChange={(open) => {
                    if (!open && pendingDeleteId !== deleteTarget?.id) {
                        setDeleteTarget(null);
                    }
                }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>일정 삭제 확인</DialogTitle>
                        <DialogDescription>
                            <strong>{deleteTarget?.title}</strong> 일정을 정말 삭제하시겠습니까?
                            <br />
                            <span className="mt-2 block text-sm text-red-600">이 작업은 되돌릴 수 없습니다.</span>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            onClick={() => setDeleteTarget(null)}
                            className="cursor-pointer"
                            disabled={pendingDeleteId === deleteTarget?.id}>
                            취소
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            size="lg"
                            onClick={() => {
                                if (deleteTarget) {
                                    void deleteSchedule(deleteTarget.id);
                                }
                            }}
                            className="cursor-pointer"
                            disabled={!deleteTarget || pendingDeleteId === deleteTarget.id}>
                            {deleteTarget && pendingDeleteId === deleteTarget.id ? "삭제 중" : "삭제"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

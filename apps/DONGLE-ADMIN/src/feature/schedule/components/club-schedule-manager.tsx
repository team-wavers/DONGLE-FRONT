"use client";

import { Button } from "@dongle/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@dongle/ui/dialog";
import { CalendarPlus } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { deleteClubScheduleAction } from "../action/schedule.action";
import type { ClubSchedule } from "../schedule.types";
import {
    groupSchedulesByMonth,
    mapClubScheduleToClubSchedule,
    sortSchedulesByStartAt,
} from "../schedule.utils";
import { ScheduleFormDialog } from "./schedule-form-dialog";
import { ScheduleListItem } from "./schedule-list-item";

interface ClubScheduleManagerProps {
    clubId: string;
    initialSchedules: ClubSchedule[];
}

type StatusFilter = "all" | "public" | "private" | "upcoming" | "past";

const statusFilterOptions = [
    ["all", "전체"],
    ["public", "공개"],
    ["private", "비공개"],
    ["upcoming", "다가오는 일정"],
    ["past", "지난 일정"],
] as const satisfies ReadonlyArray<readonly [StatusFilter, string]>;

export default function ClubScheduleManager({ clubId, initialSchedules }: ClubScheduleManagerProps) {
    const [schedules, setSchedules] = useState(initialSchedules);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<ClubSchedule | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<ClubSchedule | null>(null);
    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

    const now = useMemo(() => new Date(), []);
    const clubIdNumber = Number(clubId);
    const filteredSchedules = useMemo(() => {
        const filtered = schedules.filter((schedule) => {
            if (statusFilter === "upcoming") {
                return new Date(schedule.startsAt) >= now;
            }
            if (statusFilter === "past") {
                return new Date(schedule.startsAt) < now;
            }
            if (statusFilter === "public") return schedule.isPublic;
            if (statusFilter === "private") return !schedule.isPublic;
            return true;
        });

        return sortSchedulesByStartAt(filtered);
    }, [now, schedules, statusFilter]);
    const scheduleGroups = useMemo(() => groupSchedulesByMonth(filteredSchedules), [filteredSchedules]);

    const startCreate = useCallback(() => {
        setEditingSchedule(null);
        setIsFormOpen(true);
    }, []);

    const startEdit = useCallback((schedule: ClubSchedule) => {
        setEditingSchedule(schedule);
        setIsFormOpen(true);
    }, []);

    const closeForm = useCallback(() => {
        setIsFormOpen(false);
        setEditingSchedule(null);
    }, []);

    const deleteSchedule = async (id: number) => {
        setPendingDeleteId(id);
        const result = await deleteClubScheduleAction(clubIdNumber, id);
        setPendingDeleteId(null);

        if (!result.ok) {
            window.alert(result.formError ?? "일정 삭제 중 오류가 발생했습니다. 다시 시도해주세요.");
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
                    <Button onClick={startCreate} className="h-11 font-semibold">
                        <CalendarPlus className="h-4 w-4" />
                        일정 등록
                    </Button>
                </div>

                <div className="flex flex-wrap gap-2 border-b border-zinc-100 pb-3">
                    {statusFilterOptions.map(([value, label]) => (
                        <Button
                            key={value}
                            type="button"
                            variant={statusFilter === value ? "default" : "outline"}
                            onClick={() => setStatusFilter(value)}
                            className="h-9 rounded-full px-4">
                            {label}
                        </Button>
                    ))}
                </div>

                <div className="overflow-hidden rounded-lg border bg-white">
                    {filteredSchedules.length === 0 ? (
                        <div className="py-16 text-center text-sm text-muted-foreground">
                            조건에 맞는 일정이 없습니다.
                        </div>
                    ) : (
                        scheduleGroups.map((group) => (
                            <section key={group.key}>
                                <div className="border-b border-zinc-100 bg-zinc-50 px-4 py-2 text-sm font-bold text-zinc-700">
                                    {group.label}
                                </div>
                                {group.schedules.map((schedule) => (
                                    <ScheduleListItem
                                        key={schedule.id}
                                        schedule={schedule}
                                        isPending={pendingDeleteId === schedule.id}
                                        onEdit={startEdit}
                                        onDelete={setDeleteTarget}
                                        metaItems={[]}
                                    />
                                ))}
                            </section>
                        ))
                    )}
                </div>
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
                            disabled={!deleteTarget || pendingDeleteId === deleteTarget.id}>
                            {deleteTarget && pendingDeleteId === deleteTarget.id ? "삭제 중" : "삭제"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

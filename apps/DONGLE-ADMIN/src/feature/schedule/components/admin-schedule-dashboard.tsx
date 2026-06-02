"use client";

import { useCurrentTime } from "@/hooks/use-current-time";
import SearchInput from "@/shared/ui/navigation/search-input/search-input";
import { Button } from "@dongle/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@dongle/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@dongle/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@dongle/ui/select";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@dongle/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@dongle/ui/tabs";
import { cn } from "@dongle/ui/utils";
import type { AdminClubSchedule } from "@dongle/types/club/club.schedule";
import { CalendarDays, CalendarPlus, ChevronLeft, ChevronRight, ListChecks } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
    deleteAdminClubScheduleAction,
    getAdminClubScheduleCalendarAction,
    updateAdminClubScheduleStatusAction,
} from "../action/schedule.action";
import type { ClubSchedule, ScheduleType } from "../schedule.types";
import { SCHEDULE_TYPE_LABELS } from "../schedule.types";
import {
    filterSchedules,
    getMonthCalendarDates,
    getMonthScheduleQueryByMonthKey,
    getSchedulesForDate,
    groupSchedulesByMonth,
    isSameCalendarDate,
    mapAdminClubScheduleToClubSchedule,
    parseScheduleMonthKey,
    sortSchedulesByStartAt,
    syncScheduleInVisibleMonth,
    type ScheduleStatusFilter,
} from "../schedule.utils";
import { ScheduleListItem } from "./schedule-list-item";
import { ScheduleFormDialog } from "./schedule-form-dialog";

interface AdminScheduleDashboardProps {
    schedules: ClubSchedule[];
    initialVisibleMonth: string;
}

const monthLabelFormatter = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
});

const weekdayLabels = ["일", "월", "화", "수", "목", "금", "토"];

type ScheduleViewMode = "calendar" | "list";

const statusFilterOptions = [
    ["all", "전체 상태"],
    ["ongoing", "진행 중"],
    ["upcoming", "다가오는 일정"],
    ["past", "지난 일정"],
] as const satisfies ReadonlyArray<readonly [ScheduleStatusFilter, string]>;

const calendarChipClassName: Record<ScheduleType, string> = {
    recruitment: "border-violet-200 bg-violet-50 text-violet-800",
    event: "border-sky-200 bg-sky-50 text-sky-800",
    regular_meeting: "border-emerald-200 bg-emerald-50 text-emerald-800",
};

const dayLabelFormatter = new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "long",
});

export default function AdminScheduleDashboard({
    schedules: initialSchedules,
    initialVisibleMonth,
}: AdminScheduleDashboardProps) {
    const initialMonthDate = useMemo(() => parseScheduleMonthKey(initialVisibleMonth), [initialVisibleMonth]);
    const [schedules, setSchedules] = useState(initialSchedules);
    const [visibleMonth, setVisibleMonth] = useState(
        () => new Date(initialMonthDate.getFullYear(), initialMonthDate.getMonth(), 1)
    );
    const [selectedDate, setSelectedDate] = useState(initialMonthDate);
    const [keyword, setKeyword] = useState("");
    const [category, setCategory] = useState("all");
    const [type, setType] = useState<"all" | ScheduleType>("all");
    const [isPublic, setIsPublic] = useState<"all" | boolean>("all");
    const [status, setStatus] = useState<ScheduleStatusFilter>("all");
    const [viewMode, setViewMode] = useState<ScheduleViewMode>("calendar");
    const [isDaySheetOpen, setIsDaySheetOpen] = useState(false);
    const [pendingScheduleId, setPendingScheduleId] = useState<number | null>(null);
    const [isMonthPending, setIsMonthPending] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<ClubSchedule | null>(null);
    const [isCommonFormOpen, setIsCommonFormOpen] = useState(false);
    const [commonFormSchedule, setCommonFormSchedule] = useState<ClubSchedule | null>(null);
    const now = useCurrentTime();

    const categories = useMemo(
        () => Array.from(new Set(schedules.map((schedule) => schedule.category))).sort(),
        [schedules]
    );
    const filteredSchedules = useMemo(
        () =>
            sortSchedulesByStartAt(
                filterSchedules(schedules, {
                    keyword,
                    category,
                    type,
                    isPublic,
                    status,
                    now,
                })
            ),
        [category, isPublic, keyword, now, schedules, status, type]
    );
    const calendarDates = useMemo(
        () => getMonthCalendarDates(visibleMonth.getFullYear(), visibleMonth.getMonth()),
        [visibleMonth]
    );
    const selectedSchedules = useMemo(
        () => sortSchedulesByStartAt(getSchedulesForDate(filteredSchedules, selectedDate)),
        [filteredSchedules, selectedDate]
    );
    const scheduleGroups = useMemo(() => groupSchedulesByMonth(filteredSchedules), [filteredSchedules]);

    const loadMonthSchedules = async (monthDate: Date) => {
        const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`;

        setIsMonthPending(true);
        const result = await getAdminClubScheduleCalendarAction(getMonthScheduleQueryByMonthKey(monthKey));
        setIsMonthPending(false);

        if (!result.ok) {
            toast.error(result.formError ?? "월간 일정 조회 중 오류가 발생했습니다. 다시 시도해주세요.");
            return;
        }

        if (!result.data) {
            toast.error("월간 일정 조회 중 오류가 발생했습니다. 다시 시도해주세요.");
            return;
        }

        setSchedules(result.data.map(mapAdminClubScheduleToClubSchedule));
    };

    const moveMonth = (amount: number) => {
        const nextMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + amount, 1);

        setVisibleMonth(nextMonth);
        setSelectedDate(nextMonth);
        void loadMonthSchedules(nextMonth);
    };

    const openCommonCreateForm = () => {
        setCommonFormSchedule(null);
        setIsCommonFormOpen(true);
    };

    const openCommonEditForm = (schedule: ClubSchedule) => {
        setCommonFormSchedule(schedule);
        setIsCommonFormOpen(true);
        setIsDaySheetOpen(false);
    };

    const closeCommonForm = () => {
        setIsCommonFormOpen(false);
        setCommonFormSchedule(null);
    };

    const toggleScheduleVisibility = async (schedule: ClubSchedule) => {
        setPendingScheduleId(schedule.id);
        const result = await updateAdminClubScheduleStatusAction(schedule.id, !schedule.isPublic);
        setPendingScheduleId(null);

        if (!result.ok) {
            toast.error(result.formError ?? "공개 상태 변경 중 오류가 발생했습니다. 다시 시도해주세요.");
            return;
        }

        if (!result.data) {
            toast.error("공개 상태 변경 중 오류가 발생했습니다. 다시 시도해주세요.");
            return;
        }

        const updatedSchedule = mapAdminClubScheduleToClubSchedule(result.data);
        setSchedules((current) =>
            current.map((currentSchedule) =>
                currentSchedule.id === updatedSchedule.id ? updatedSchedule : currentSchedule
            )
        );
    };

    const deleteSchedule = async (schedule: ClubSchedule) => {
        setPendingScheduleId(schedule.id);
        const result = await deleteAdminClubScheduleAction(schedule.id);
        setPendingScheduleId(null);

        if (!result.ok) {
            toast.error(result.formError ?? "일정 삭제 중 오류가 발생했습니다. 다시 시도해주세요.");
            return;
        }

        setSchedules((current) => current.filter((currentSchedule) => currentSchedule.id !== schedule.id));
        setDeleteTarget(null);
    };

    return (
        <div className="flex w-full flex-col gap-6">
            <Card className="rounded-lg border-zinc-200 shadow-xs">
                <CardContent className="flex flex-col gap-3">
                    <SearchInput value={keyword} onChange={setKeyword} placeholder="동아리명, 일정명, 장소 검색" />
                    <div className="grid gap-3 md:grid-cols-4">
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger className="h-11 w-full rounded-xl bg-white">
                                <SelectValue placeholder="분과" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">전체 분과</SelectItem>
                                {categories.map((item) => (
                                    <SelectItem key={item} value={item}>
                                        {item}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={type} onValueChange={(value) => setType(value as "all" | ScheduleType)}>
                            <SelectTrigger className="h-11 w-full rounded-xl bg-white">
                                <SelectValue placeholder="유형" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">전체 유형</SelectItem>
                                {Object.entries(SCHEDULE_TYPE_LABELS).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={isPublic === "all" ? "all" : String(isPublic)}
                            onValueChange={(value) =>
                                setIsPublic(value === "all" ? "all" : value === "true")
                            }>
                            <SelectTrigger className="h-11 w-full rounded-xl bg-white">
                                <SelectValue placeholder="공개 상태" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">전체 공개 상태</SelectItem>
                                <SelectItem value="true">공개</SelectItem>
                                <SelectItem value="false">비공개</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={status} onValueChange={(value) => setStatus(value as ScheduleStatusFilter)}>
                            <SelectTrigger className="h-11 w-full rounded-xl bg-white">
                                <SelectValue placeholder="진행 상태" />
                            </SelectTrigger>
                            <SelectContent>
                                {statusFilterOptions.map(([value, label]) => (
                                    <SelectItem key={value} value={value}>
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ScheduleViewMode)} className="gap-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                        <TabsList className="h-10">
                            <TabsTrigger value="calendar" className="px-4">
                                <CalendarDays className="h-4 w-4" />
                                캘린더
                            </TabsTrigger>
                            <TabsTrigger value="list" className="px-4">
                                <ListChecks className="h-4 w-4" />
                                목록
                            </TabsTrigger>
                        </TabsList>
                        <Button
                            type="button"
                            variant="outline"
                            className="h-10 cursor-pointer gap-2 font-semibold"
                            onClick={openCommonCreateForm}>
                            <CalendarPlus className="h-4 w-4" />
                            공통 일정 등록
                        </Button>
                    </div>
                    <p className="text-sm font-medium text-zinc-500">
                        {monthLabelFormatter.format(visibleMonth)} 기준 {filteredSchedules.length}건
                    </p>
                </div>

                <TabsContent value="calendar" className="mt-0">
                    <Card className="rounded-lg border-zinc-200 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between gap-4">
                            <CardTitle className="text-xl">{monthLabelFormatter.format(visibleMonth)}</CardTitle>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    disabled={isMonthPending}
                                    onClick={() => moveMonth(-1)}
                                    className="cursor-pointer">
                                    <ChevronLeft className="h-4 w-4" />
                                    <span className="sr-only">이전 달</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    disabled={isMonthPending}
                                    onClick={() => moveMonth(1)}
                                    className="cursor-pointer">
                                    <ChevronRight className="h-4 w-4" />
                                    <span className="sr-only">다음 달</span>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-7 overflow-hidden rounded-lg border border-zinc-200 bg-white text-center text-sm font-semibold text-zinc-500">
                                {weekdayLabels.map((weekday) => (
                                    <div key={weekday} className="border-b border-r border-zinc-100 bg-zinc-50 py-2 last:border-r-0">
                                        {weekday}
                                    </div>
                                ))}
                                {calendarDates.map((date) => {
                                    const daySchedules = getSchedulesForDate(filteredSchedules, date);
                                    const isCurrentMonth = date.getMonth() === visibleMonth.getMonth();
                                    const isSelected = isSameCalendarDate(date, selectedDate);

                                    return (
                                        <button
                                            key={date.toISOString()}
                                            type="button"
                                            onClick={() => {
                                                setSelectedDate(date);
                                                setIsDaySheetOpen(true);
                                            }}
                                            className={[
                                                "min-h-28 border-b border-r border-zinc-100 bg-white p-2 text-left align-top transition-colors hover:bg-sky-50/70",
                                                isSelected ? "bg-sky-50 ring-2 ring-inset ring-sky-500" : "",
                                                isCurrentMonth ? "text-zinc-900" : "text-zinc-300",
                                            ].join(" ")}>
                                            <span className="text-sm font-semibold">{date.getDate()}</span>
                                            <div className="mt-2 flex flex-col gap-1">
                                                {daySchedules.slice(0, 3).map((schedule) => (
                                                    <span
                                                        key={schedule.id}
                                                        className={cn(
                                                            "truncate rounded-md border px-2 py-1 text-xs font-semibold",
                                                            calendarChipClassName[schedule.type]
                                                        )}>
                                                        {SCHEDULE_TYPE_LABELS[schedule.type]} · {schedule.clubName} · {schedule.title}
                                                    </span>
                                                ))}
                                                {daySchedules.length > 3 ? (
                                                    <span className="text-xs font-semibold text-zinc-500">
                                                        +{daySchedules.length - 3}건 더보기
                                                    </span>
                                                ) : null}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="list" className="mt-0">
                    <Card className="rounded-lg border-zinc-200 shadow-xs">
                        <CardHeader>
                            <CardTitle className="text-lg">월간 일정 목록</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {filteredSchedules.length === 0 ? (
                                <div className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
                                    조건에 맞는 일정이 없습니다.
                                </div>
                            ) : (
                                <div className="overflow-hidden rounded-lg border bg-white">
                                    {scheduleGroups.map((group) => (
                                        <section key={group.key}>
                                            <div className="border-b border-zinc-100 bg-zinc-50 px-4 py-2 text-sm font-bold text-zinc-700">
                                                {group.label}
                                            </div>
                                            {group.schedules.map((schedule) => (
                                                <ScheduleListItem
                                                    key={schedule.id}
                                                    schedule={schedule}
                                                    variant="admin"
                                                    isPending={pendingScheduleId === schedule.id}
                                                    onEdit={schedule.clubId === null ? openCommonEditForm : undefined}
                                                    onToggleVisibility={toggleScheduleVisibility}
                                                    onDelete={setDeleteTarget}
                                                />
                                            ))}
                                        </section>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Sheet open={isDaySheetOpen} onOpenChange={setIsDaySheetOpen}>
                <SheetContent side="right" className="w-full overflow-y-auto p-0 sm:max-w-xl">
                    <SheetHeader className="border-b border-zinc-100 px-5 py-5 pr-12">
                        <SheetTitle className="text-xl">{dayLabelFormatter.format(selectedDate)} 일정</SheetTitle>
                        <SheetDescription>선택한 날짜에 포함되는 일정 {selectedSchedules.length}건</SheetDescription>
                    </SheetHeader>
                    <div className="flex flex-col gap-3 p-5">
                        {selectedSchedules.length === 0 ? (
                            <div className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
                                선택한 날짜의 일정이 없습니다.
                            </div>
                        ) : (
                            selectedSchedules.map((schedule) => (
                                <ScheduleListItem
                                    key={schedule.id}
                                    schedule={schedule}
                                    variant="admin"
                                    className="rounded-lg border"
                                    isPending={pendingScheduleId === schedule.id}
                                    onEdit={schedule.clubId === null ? openCommonEditForm : undefined}
                                    onToggleVisibility={toggleScheduleVisibility}
                                    onDelete={setDeleteTarget}
                                />
                            ))
                        )}
                    </div>
                </SheetContent>
            </Sheet>

            <Dialog
                open={deleteTarget !== null}
                onOpenChange={(open) => {
                    if (!open && pendingScheduleId !== deleteTarget?.id) {
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
                            onClick={() => setDeleteTarget(null)}
                            className="cursor-pointer"
                            disabled={pendingScheduleId === deleteTarget?.id}>
                            취소
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={() => {
                                if (deleteTarget) {
                                    void deleteSchedule(deleteTarget);
                                }
                            }}
                            className="cursor-pointer"
                            disabled={!deleteTarget || pendingScheduleId === deleteTarget.id}>
                            {deleteTarget && pendingScheduleId === deleteTarget.id ? "삭제 중" : "삭제"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ScheduleFormDialog
                clubId={null}
                open={isCommonFormOpen}
                schedule={commonFormSchedule}
                onOpenChange={(open) => {
                    if (open) {
                        setIsCommonFormOpen(true);
                        return;
                    }

                    closeCommonForm();
                }}
                onSuccess={(schedule) => {
                    const nextSchedule = mapAdminClubScheduleToClubSchedule(schedule as AdminClubSchedule);
                    const visibleMonthKey = `${visibleMonth.getFullYear()}-${String(visibleMonth.getMonth() + 1).padStart(2, "0")}`;
                    setSchedules((current) => syncScheduleInVisibleMonth(current, nextSchedule, visibleMonthKey));
                    closeCommonForm();
                }}
            />
        </div>
    );
}

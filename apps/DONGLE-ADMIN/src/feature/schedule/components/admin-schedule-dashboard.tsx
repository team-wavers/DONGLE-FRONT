"use client";

import SearchInput from "@/components/molecules/search-input/search-input";
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
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
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
    getMonthScheduleQuery,
    getSchedulesForDate,
    groupSchedulesByMonth,
    isSameCalendarDate,
    mapAdminClubScheduleToClubSchedule,
    sortSchedulesByStartAt,
} from "../schedule.utils";
import { ScheduleListItem } from "./schedule-list-item";

interface AdminScheduleDashboardProps {
    schedules: ClubSchedule[];
    initialVisibleMonth: string;
}

const monthLabelFormatter = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
});

const weekdayLabels = ["일", "월", "화", "수", "목", "금", "토"];

export default function AdminScheduleDashboard({
    schedules: initialSchedules,
    initialVisibleMonth,
}: AdminScheduleDashboardProps) {
    const initialMonthDate = useMemo(() => new Date(initialVisibleMonth), [initialVisibleMonth]);
    const [schedules, setSchedules] = useState(initialSchedules);
    const [visibleMonth, setVisibleMonth] = useState(
        () => new Date(initialMonthDate.getFullYear(), initialMonthDate.getMonth(), 1)
    );
    const [selectedDate, setSelectedDate] = useState(initialMonthDate);
    const [keyword, setKeyword] = useState("");
    const [category, setCategory] = useState("all");
    const [type, setType] = useState<"all" | ScheduleType>("all");
    const [isPublic, setIsPublic] = useState<"all" | boolean>("all");
    const [pendingScheduleId, setPendingScheduleId] = useState<number | null>(null);
    const [isMonthPending, setIsMonthPending] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<ClubSchedule | null>(null);

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
                })
            ),
        [category, isPublic, keyword, schedules, type]
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
        setIsMonthPending(true);
        const result = await getAdminClubScheduleCalendarAction(getMonthScheduleQuery(monthDate));
        setIsMonthPending(false);

        if (!result.ok) {
            window.alert(result.formError ?? "월간 일정 조회 중 오류가 발생했습니다. 다시 시도해주세요.");
            return;
        }

        if (!result.data) {
            window.alert("월간 일정 조회 중 오류가 발생했습니다. 다시 시도해주세요.");
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

    const toggleScheduleVisibility = async (schedule: ClubSchedule) => {
        setPendingScheduleId(schedule.id);
        const result = await updateAdminClubScheduleStatusAction(schedule.id, !schedule.isPublic);
        setPendingScheduleId(null);

        if (!result.ok) {
            window.alert(result.formError ?? "공개 상태 변경 중 오류가 발생했습니다. 다시 시도해주세요.");
            return;
        }

        if (!result.data) {
            window.alert("공개 상태 변경 중 오류가 발생했습니다. 다시 시도해주세요.");
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
            window.alert(result.formError ?? "일정 삭제 중 오류가 발생했습니다. 다시 시도해주세요.");
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
                    <div className="grid gap-3 md:grid-cols-3">
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
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
                <Card className="rounded-lg border-zinc-200 shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between gap-4">
                        <CardTitle className="text-xl">{monthLabelFormatter.format(visibleMonth)}</CardTitle>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" disabled={isMonthPending} onClick={() => moveMonth(-1)}>
                                <ChevronLeft className="h-4 w-4" />
                                <span className="sr-only">이전 달</span>
                            </Button>
                            <Button variant="outline" size="icon" disabled={isMonthPending} onClick={() => moveMonth(1)}>
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
                                        onClick={() => setSelectedDate(date)}
                                        className={[
                                            "min-h-24 border-b border-r border-zinc-100 bg-white p-2 text-left align-top transition-colors hover:bg-sky-50/70",
                                            isSelected ? "bg-sky-50 ring-2 ring-inset ring-sky-500" : "",
                                            isCurrentMonth ? "text-zinc-900" : "text-zinc-300",
                                        ].join(" ")}>
                                        <span className="text-sm font-semibold">{date.getDate()}</span>
                                        <div className="mt-2 flex flex-col gap-1">
                                            {daySchedules.slice(0, 2).map((schedule) => (
                                                <span
                                                    key={schedule.id}
                                                    className="truncate rounded-md bg-sky-50 px-2 py-1 text-xs font-medium text-sky-700">
                                                    {schedule.clubName} · {schedule.title}
                                                </span>
                                            ))}
                                            {daySchedules.length > 2 ? (
                                                <span className="text-xs font-semibold text-zinc-500">
                                                    +{daySchedules.length - 2}건 더보기
                                                </span>
                                            ) : null}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-lg border-zinc-200 shadow-xs">
                    <CardHeader>
                        <CardTitle className="text-lg">
                            {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 일정
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                        {selectedSchedules.length === 0 ? (
                            <div className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
                                선택한 날짜의 일정이 없습니다.
                            </div>
                        ) : (
                            selectedSchedules.map((schedule) => (
                                <ScheduleListItem
                                    key={schedule.id}
                                    schedule={schedule}
                                    className="rounded-lg border"
                                    isPending={pendingScheduleId === schedule.id}
                                    onToggleVisibility={toggleScheduleVisibility}
                                    onDelete={setDeleteTarget}
                                    metaItems={[schedule.clubName, schedule.category]}
                                />
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>

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
                                            isPending={pendingScheduleId === schedule.id}
                                            onToggleVisibility={toggleScheduleVisibility}
                                            onDelete={setDeleteTarget}
                                            metaItems={[schedule.clubName, schedule.category]}
                                        />
                                    ))}
                                </section>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

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
                            disabled={!deleteTarget || pendingScheduleId === deleteTarget.id}>
                            {deleteTarget && pendingScheduleId === deleteTarget.id ? "삭제 중" : "삭제"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@dongle/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@dongle/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@dongle/ui/sheet";
import { groupScheduleDisplayItemsByMonth } from "@dongle/ui/schedules/schedule-display";
import { ScheduleDisplayMonthList } from "@dongle/ui/schedules/schedule-display-list";
import { cn } from "@dongle/ui/utils";
import { CalendarDays, ChevronLeft, ChevronRight, ListChecks } from "lucide-react";
import { trackDongleEvent } from "@/lib/analytics";
import type { ClubPublicSchedule } from "@/lib/club-schedule.types";
import {
    getPublicScheduleCalendarDates,
    getPublicSchedulesForDate,
    mapPublicScheduleToDisplayItem,
    parsePublicScheduleMonthKey,
    sortPublicSchedulesByStartAt,
} from "@/lib/public-schedule-calendar";

interface PublicScheduleCalendarProps {
    schedules: ClubPublicSchedule[];
    visibleMonthKey: string;
    loadFailed?: boolean;
}

const weekdayLabels = ["일", "월", "화", "수", "목", "금", "토"];

const monthLabelFormatter = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
});

const dayLabelFormatter = new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "long",
});

const calendarChipClassName: Record<ClubPublicSchedule["type"], string> = {
    recruitment: "border-violet-200 bg-violet-50 text-violet-800",
    event: "border-sky-200 bg-sky-50 text-sky-800",
    regular_meeting: "border-emerald-200 bg-emerald-50 text-emerald-800",
};

const scheduleTypeLabels: Record<ClubPublicSchedule["type"], string> = {
    recruitment: "모집",
    event: "행사",
    regular_meeting: "정기모임",
};

function getMonthHref(date: Date) {
    return `/schedules?month=${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function isSameCalendarDate(left: Date, right: Date) {
    return (
        left.getFullYear() === right.getFullYear() &&
        left.getMonth() === right.getMonth() &&
        left.getDate() === right.getDate()
    );
}

export default function PublicScheduleCalendar({
    schedules,
    visibleMonthKey,
    loadFailed = false,
}: PublicScheduleCalendarProps) {
    const visibleMonth = useMemo(() => parsePublicScheduleMonthKey(visibleMonthKey), [visibleMonthKey]);
    const [selectedDate, setSelectedDate] = useState(visibleMonth);
    const [isDaySheetOpen, setIsDaySheetOpen] = useState(false);
    const calendarDates = useMemo(() => getPublicScheduleCalendarDates(visibleMonthKey), [visibleMonthKey]);
    const selectedSchedules = useMemo(
        () => getPublicSchedulesForDate(schedules, selectedDate),
        [schedules, selectedDate]
    );
    const selectedItems = useMemo(
        () => selectedSchedules.map(mapPublicScheduleToDisplayItem),
        [selectedSchedules]
    );
    const monthGroups = useMemo(
        () => groupScheduleDisplayItemsByMonth(sortPublicSchedulesByStartAt(schedules).map(mapPublicScheduleToDisplayItem)),
        [schedules]
    );
    const previousMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1);
    const nextMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1);
    const hasSchedules = !loadFailed && schedules.length > 0;

    useEffect(() => {
        setSelectedDate(visibleMonth);
    }, [visibleMonth]);

    const handleExternalLinkClick = (item: ReturnType<typeof mapPublicScheduleToDisplayItem>) => {
        const schedule = item.payload;

        if (!schedule || !item.externalUrl) {
            return;
        }

        trackDongleEvent("schedule_external_link_click", {
            club_id: schedule.clubId,
            club_name: schedule.clubName ?? "총동아리연합회",
            destination: item.externalUrl,
        });
    };

    return (
        <section className="space-y-5 py-6 md:py-10">
            <header className="flex flex-col gap-3 border-b border-zinc-100 pb-5 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-normal text-zinc-950 md:text-4xl">전체 일정</h1>
                    <p className="mt-2 text-sm font-semibold text-zinc-500">
                        공개된 동아리 일정과 총동연 공통 일정을 함께 확인합니다.
                    </p>
                </div>
                <Button asChild variant="outline" className="w-fit">
                    <Link href="/">동아리 목록으로</Link>
                </Button>
            </header>

            <div>
                <Card className="rounded-lg border-zinc-200 shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between gap-4">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <CalendarDays className="h-5 w-5 text-zinc-400" />
                            {monthLabelFormatter.format(visibleMonth)}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Button asChild variant="outline" size="icon">
                                <Link href={getMonthHref(previousMonth)} aria-label="이전 달">
                                    <ChevronLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="icon">
                                <Link href={getMonthHref(nextMonth)} aria-label="다음 달">
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-7 overflow-hidden rounded-lg border border-zinc-200 bg-white text-center text-xs font-semibold text-zinc-500 md:text-sm">
                            {weekdayLabels.map((weekday) => (
                                <div key={weekday} className="border-b border-r border-zinc-100 bg-zinc-50 py-2 last:border-r-0">
                                    {weekday}
                                </div>
                            ))}
                            {calendarDates.map((date) => {
                                const daySchedules = getPublicSchedulesForDate(schedules, date);
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
                                        className={cn(
                                            "min-h-24 border-b border-r border-zinc-100 bg-white p-1.5 text-left align-top transition-colors hover:bg-sky-50/70 md:min-h-28 md:p-2",
                                            isSelected && "bg-sky-50 ring-2 ring-inset ring-sky-500",
                                            isCurrentMonth ? "text-zinc-900" : "text-zinc-300"
                                        )}>
                                        <span className="text-sm font-semibold">{date.getDate()}</span>
                                        <div className="mt-2 flex flex-col gap-1">
                                            {daySchedules.slice(0, 3).map((schedule) => (
                                                <span
                                                    key={schedule.id}
                                                    className={cn(
                                                        "truncate rounded-md border px-1.5 py-1 text-[11px] font-bold md:px-2",
                                                        calendarChipClassName[schedule.type]
                                                    )}>
                                                    {scheduleTypeLabels[schedule.type]} · {schedule.clubName} · {schedule.title}
                                                </span>
                                            ))}
                                            {daySchedules.length > 3 ? (
                                                <span className="text-[11px] font-bold text-zinc-500">
                                                    +{daySchedules.length - 3}건
                                                </span>
                                            ) : null}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Sheet open={isDaySheetOpen} onOpenChange={setIsDaySheetOpen}>
                <SheetContent side="right" className="w-full overflow-y-auto p-0 sm:max-w-xl">
                    <SheetHeader className="border-b border-zinc-100 px-5 py-5 pr-12">
                        <SheetTitle className="text-xl">{dayLabelFormatter.format(selectedDate)} 일정</SheetTitle>
                        <SheetDescription>선택한 날짜에 포함되는 일정 {selectedItems.length}건</SheetDescription>
                    </SheetHeader>
                    <div className="flex flex-col gap-3 p-5">
                        {loadFailed ? (
                            <div className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
                                일정을 불러오지 못했습니다. 잠시 후 다시 확인해주세요.
                            </div>
                        ) : selectedItems.length > 0 ? (
                            <ScheduleDisplayMonthList
                                groups={[{ key: "selected-date", label: "선택한 날짜", items: selectedItems }]}
                                showClubMeta
                                ariaLabel="선택한 날짜 일정"
                                onExternalLinkClick={handleExternalLinkClick}
                            />
                        ) : (
                            <div className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
                                선택한 날짜의 일정이 없습니다.
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>

            <section className="space-y-3">
                <div className="flex items-center gap-2">
                    <ListChecks className="h-5 w-5 text-zinc-400" />
                    <h2 className="text-lg font-extrabold text-zinc-950">월간 전체 일정</h2>
                    <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-extrabold text-zinc-500">
                        {schedules.length}개
                    </span>
                </div>
                {loadFailed ? (
                    <div className="rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground">
                        전체 일정을 불러오지 못했습니다. 잠시 후 다시 확인해주세요.
                    </div>
                ) : hasSchedules ? (
                    <ScheduleDisplayMonthList
                        groups={monthGroups}
                        showClubMeta
                        ariaLabel="월간 전체 일정 목록"
                        onExternalLinkClick={handleExternalLinkClick}
                    />
                ) : (
                    <div className="rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground">
                        이 달에 등록된 공개 일정이 없습니다.
                    </div>
                )}
            </section>
        </section>
    );
}

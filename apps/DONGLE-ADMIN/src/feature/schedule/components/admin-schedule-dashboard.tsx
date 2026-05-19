"use client";

import SearchInput from "@/components/molecules/search-input/search-input";
import { Button } from "@dongle/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@dongle/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@dongle/ui/select";
import { ChevronLeft, ChevronRight, ExternalLink, MapPin, Trash2 } from "lucide-react";
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
    formatScheduleDateTime,
    formatScheduleTime,
    getMonthCalendarDates,
    getMonthScheduleQuery,
    getSchedulesForDate,
    isSameCalendarDate,
    mapAdminClubScheduleToClubSchedule,
    sortSchedulesByStartAt,
} from "../schedule.utils";
import { ScheduleIsPublicBadge, ScheduleTypeBadge } from "./schedule-badges";

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

    const loadMonthSchedules = async (monthDate: Date) => {
        setIsMonthPending(true);
        const result = await getAdminClubScheduleCalendarAction(getMonthScheduleQuery(monthDate));
        setIsMonthPending(false);

        if (!result.success || !result.result) {
            window.alert(result.error ?? "월간 일정 조회 중 오류가 발생했습니다. 다시 시도해주세요.");
            return;
        }

        setSchedules(result.result.map(mapAdminClubScheduleToClubSchedule));
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

        if (!result.success || !result.result) {
            window.alert(result.error ?? "공개 상태 변경 중 오류가 발생했습니다. 다시 시도해주세요.");
            return;
        }

        const updatedSchedule = mapAdminClubScheduleToClubSchedule(result.result);
        setSchedules((current) =>
            current.map((currentSchedule) =>
                currentSchedule.id === updatedSchedule.id ? updatedSchedule : currentSchedule
            )
        );
    };

    const deleteSchedule = async (schedule: ClubSchedule) => {
        if (!window.confirm("일정을 삭제하시겠습니까?")) {
            return;
        }

        setPendingScheduleId(schedule.id);
        const result = await deleteAdminClubScheduleAction(schedule.id);
        setPendingScheduleId(null);

        if (!result.success) {
            window.alert(result.error ?? "일정 삭제 중 오류가 발생했습니다. 다시 시도해주세요.");
            return;
        }

        setSchedules((current) => current.filter((currentSchedule) => currentSchedule.id !== schedule.id));
    };

    return (
        <div className="flex w-full flex-col gap-6">
            <Card className="rounded-lg">
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

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
                <Card className="rounded-lg">
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
                        <div className="grid grid-cols-7 border-l border-t text-center text-sm font-semibold text-zinc-500">
                            {weekdayLabels.map((weekday) => (
                                <div key={weekday} className="border-b border-r py-2">
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
                                            "min-h-28 border-b border-r bg-white p-2 text-left align-top transition-colors hover:bg-sky-50",
                                            isSelected ? "ring-2 ring-inset ring-sky-500" : "",
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

                <Card className="rounded-lg">
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
                                <div key={schedule.id} className="rounded-lg border p-4">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <ScheduleTypeBadge type={schedule.type} />
                                        <ScheduleIsPublicBadge isPublic={schedule.isPublic} />
                                    </div>
                                    <h3 className="mt-3 text-base font-bold">{schedule.title}</h3>
                                    <p className="mt-1 text-sm font-semibold text-zinc-700">{schedule.clubName}</p>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {formatScheduleTime(schedule.startsAt)} - {formatScheduleTime(schedule.endsAt)}
                                    </p>
                                    <p className="mt-2 flex items-center gap-1 text-sm text-zinc-600">
                                        <MapPin className="h-4 w-4" />
                                        {schedule.location}
                                    </p>
                                    <p className="mt-3 text-sm leading-6 text-zinc-600">{schedule.description}</p>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            disabled={pendingScheduleId === schedule.id}
                                            onClick={() => toggleScheduleVisibility(schedule)}>
                                            {pendingScheduleId === schedule.id
                                                ? "변경 중"
                                                : schedule.isPublic
                                                  ? "비공개로 전환"
                                                  : "공개로 전환"}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            disabled={pendingScheduleId === schedule.id}
                                            onClick={() => deleteSchedule(schedule)}>
                                            <Trash2 className="h-4 w-4" />
                                            삭제
                                        </Button>
                                        {schedule.externalUrl ? (
                                            <Button variant="outline" size="sm" asChild>
                                                <a href={schedule.externalUrl} target="_blank" rel="noreferrer">
                                                    <ExternalLink className="h-4 w-4" />
                                                    외부 링크 열기
                                                </a>
                                            </Button>
                                        ) : null}
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card className="rounded-lg">
                <CardHeader>
                    <CardTitle className="text-lg">월간 일정 목록</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                    {filteredSchedules.map((schedule) => (
                        <div
                            key={schedule.id}
                            className="grid gap-4 rounded-lg border p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <ScheduleTypeBadge type={schedule.type} />
                                    <ScheduleIsPublicBadge isPublic={schedule.isPublic} />
                                </div>
                                <h3 className="mt-3 truncate text-base font-bold">{schedule.title}</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {schedule.clubName} · {schedule.category} · {schedule.location}
                                </p>
                            </div>
                            <div className="text-sm font-semibold text-zinc-700 md:text-right">
                                <p>{formatScheduleDateTime(schedule.startsAt)}</p>
                                <p className="mt-1 text-muted-foreground">{formatScheduleTime(schedule.endsAt)} 종료</p>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}

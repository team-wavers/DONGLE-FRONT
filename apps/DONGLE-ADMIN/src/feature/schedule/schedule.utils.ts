import { COMMON_CLUB_SCHEDULE_LABEL } from "@dongle/types";
import type { AdminClubSchedule, ClubSchedule as ApiClubSchedule } from "@dongle/types/club/club.schedule";
import {
    formatDateForRequest,
    formatDateTimeForInput,
    formatMonthKey,
    getDateTimeTimestamp,
    getMonthDateTimeRange,
    matchesKeyword,
    parseMonthKey,
} from "@dongle/utils";
import type { ClubSchedule, ScheduleType } from "./schedule.types";

const SCHEDULE_TIME_ZONE = "Asia/Seoul";

export { buildClubSchedulePayload, getScheduleExternalUrlError } from "./form/schedule-form.schema";

export interface ScheduleFilters {
    keyword: string;
    category: string;
    type: "all" | ScheduleType;
    isPublic: "all" | boolean;
    status: ScheduleStatusFilter;
    now: Date;
    dateRange?: ScheduleDateRangeFilter;
}

export type ScheduleStatusFilter = "all" | "ongoing" | "upcoming" | "past";
export type ScheduleDateFilter = "all" | "today" | "thisWeek" | "thisMonth" | "custom";

export interface ScheduleDateRangeFilter {
    from?: string;
    to?: string;
}

export function getMonthCalendarDates(year: number, monthIndex: number) {
    const firstDate = new Date(year, monthIndex, 1);
    const startDate = new Date(firstDate);
    startDate.setDate(firstDate.getDate() - firstDate.getDay());

    return Array.from({ length: 42 }, (_, index) => {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + index);
        return date;
    });
}

export function isSameCalendarDate(a: Date, b: Date) {
    return getScheduleCalendarDateKey(a) === getScheduleCalendarDateKey(b);
}

export function getSchedulesForDate(schedules: ClubSchedule[], date: Date) {
    const selectedDate = getScheduleCalendarDateKey(date);

    return schedules.filter((schedule) => {
        const startDate = formatDateForRequest(schedule.startsAt, { timeZone: SCHEDULE_TIME_ZONE });
        const endDate = formatDateForRequest(schedule.endsAt, { timeZone: SCHEDULE_TIME_ZONE });

        return startDate <= selectedDate && selectedDate <= endDate;
    });
}

export function getScheduleCalendarDateKey(date: Date) {
    return formatDateForRequest(date, { timeZone: SCHEDULE_TIME_ZONE });
}

// 캘린더 셀(최대 42개)마다 전체 schedules를 다시 필터링하지 않도록, 일정별 시작/종료 키를
// 한 번씩만 계산해 날짜 키 -> 일정 목록 매핑을 만든다. 렌더 중 호출하지 않고 useMemo로 캐시할 것.
export function buildScheduleCalendarIndex(schedules: ClubSchedule[], dateKeys: string[]) {
    const index = new Map<string, ClubSchedule[]>();

    for (const dateKey of dateKeys) {
        index.set(dateKey, []);
    }

    for (const schedule of schedules) {
        const startKey = formatDateForRequest(schedule.startsAt, { timeZone: SCHEDULE_TIME_ZONE });
        const endKey = formatDateForRequest(schedule.endsAt, { timeZone: SCHEDULE_TIME_ZONE });

        for (const dateKey of dateKeys) {
            if (startKey <= dateKey && dateKey <= endKey) {
                index.get(dateKey)?.push(schedule);
            }
        }
    }

    return index;
}

export function filterSchedules(schedules: ClubSchedule[], filters: ScheduleFilters) {
    const dateRange = normalizeScheduleDateRange(filters.dateRange);

    return schedules.filter((schedule) => {
        const matchesScheduleKeyword = matchesKeyword(
            [schedule.title, schedule.clubName, schedule.category, schedule.location].join(" "),
            filters.keyword
        );

        return (
            matchesScheduleKeyword &&
            (filters.category === "all" || schedule.category === filters.category) &&
            (filters.type === "all" || schedule.type === filters.type) &&
            (filters.isPublic === "all" || schedule.isPublic === filters.isPublic) &&
            (!dateRange || isScheduleOverlappingDateRange(schedule, dateRange)) &&
            (filters.status === "all" ||
                (filters.status === "ongoing" && isScheduleOngoing(schedule, filters.now)) ||
                (filters.status === "upcoming" && isScheduleUpcoming(schedule, filters.now)) ||
                (filters.status === "past" && isSchedulePast(schedule, filters.now)))
        );
    });
}

export function getScheduleDateRangeFilter(
    filter: ScheduleDateFilter,
    now: Date,
    customRange?: ScheduleDateRangeFilter
): ScheduleDateRangeFilter | undefined {
    if (filter === "all") {
        return undefined;
    }

    if (filter === "custom") {
        return normalizeScheduleDateRange(customRange);
    }

    const today = formatDateForRequest(now, { timeZone: SCHEDULE_TIME_ZONE });
    const todayDate = parseDateKey(today);

    if (!todayDate) {
        return undefined;
    }

    if (filter === "today") {
        return { from: today, to: today };
    }

    if (filter === "thisWeek") {
        const mondayOffset = (todayDate.getDay() + 6) % 7;
        const monday = addDays(todayDate, -mondayOffset);
        const sunday = addDays(monday, 6);

        return {
            from: formatDateKey(monday),
            to: formatDateKey(sunday),
        };
    }

    const year = todayDate.getFullYear();
    const month = todayDate.getMonth();

    return {
        from: formatDateKey(new Date(year, month, 1)),
        to: formatDateKey(new Date(year, month + 1, 0)),
    };
}

export function sortSchedulesByStartAt(schedules: ClubSchedule[]) {
    return [...schedules].sort((a, b) => getSortableScheduleTimestamp(a.startsAt) - getSortableScheduleTimestamp(b.startsAt));
}

function sortSchedulesByEndAt(schedules: ClubSchedule[]) {
    return [...schedules].sort((a, b) => getSortableScheduleTimestamp(a.endsAt) - getSortableScheduleTimestamp(b.endsAt));
}

function getScheduleTimestamp(value: string) {
    return getDateTimeTimestamp(value, { timeZone: SCHEDULE_TIME_ZONE });
}

function getSortableScheduleTimestamp(value: string) {
    const timestamp = getScheduleTimestamp(value);

    return Number.isNaN(timestamp) ? Number.MAX_SAFE_INTEGER : timestamp;
}

function getScheduleDistanceFromNow(schedule: ClubSchedule, nowTime: number) {
    const startsAt = getSortableScheduleTimestamp(schedule.startsAt);
    const endsAt = getSortableScheduleTimestamp(schedule.endsAt);

    if (startsAt > nowTime) {
        return { distance: startsAt - nowTime, priority: 0 };
    }

    return { distance: nowTime - endsAt, priority: 1 };
}

export function sortSchedulesByDistanceFromNow(schedules: ClubSchedule[], now: Date) {
    const nowTime = now.getTime();

    return [...schedules].sort((a, b) => {
        const aDistance = getScheduleDistanceFromNow(a, nowTime);
        const bDistance = getScheduleDistanceFromNow(b, nowTime);

        if (aDistance.distance !== bDistance.distance) {
            return aDistance.distance - bDistance.distance;
        }

        if (aDistance.priority !== bDistance.priority) {
            return aDistance.priority - bDistance.priority;
        }

        return getSortableScheduleTimestamp(a.startsAt) - getSortableScheduleTimestamp(b.startsAt);
    });
}

export function getSeparatedScheduleGroups(schedules: ClubSchedule[], now: Date) {
    return {
        ongoing: sortSchedulesByEndAt(schedules.filter((schedule) => isScheduleOngoing(schedule, now))),
        remaining: sortSchedulesByDistanceFromNow(
            schedules.filter((schedule) => !isScheduleOngoing(schedule, now)),
            now
        ),
    };
}

export function isSchedulePast(schedule: Pick<ClubSchedule, "endsAt">, now: Date) {
    return getScheduleTimestamp(schedule.endsAt) < now.getTime();
}

export function isScheduleOngoing(schedule: Pick<ClubSchedule, "startsAt" | "endsAt">, now: Date) {
    const nowTime = now.getTime();
    return getScheduleTimestamp(schedule.startsAt) <= nowTime && getScheduleTimestamp(schedule.endsAt) >= nowTime;
}

export function isScheduleUpcoming(schedule: Pick<ClubSchedule, "startsAt">, now: Date) {
    return getScheduleTimestamp(schedule.startsAt) > now.getTime();
}

function normalizeScheduleDateRange(range?: ScheduleDateRangeFilter): ScheduleDateRangeFilter | undefined {
    const from = normalizeDateKey(range?.from);
    const to = normalizeDateKey(range?.to);

    if (!from && !to) {
        return undefined;
    }

    if (from && to && from > to) {
        return { from: to, to: from };
    }

    return { from, to };
}

function isScheduleOverlappingDateRange(schedule: ClubSchedule, range: ScheduleDateRangeFilter) {
    const startsAt = formatDateForRequest(schedule.startsAt, { timeZone: SCHEDULE_TIME_ZONE });
    const endsAt = formatDateForRequest(schedule.endsAt, { timeZone: SCHEDULE_TIME_ZONE });

    if (!startsAt || !endsAt) {
        return false;
    }

    return (!range.from || endsAt >= range.from) && (!range.to || startsAt <= range.to);
}

function normalizeDateKey(value?: string) {
    if (!value) {
        return undefined;
    }

    const dateKey = value.trim().slice(0, 10);

    return parseDateKey(dateKey) ? dateKey : undefined;
}

function parseDateKey(value: string) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

    if (!match) {
        return null;
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(year, month - 1, day);

    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
        return null;
    }

    return date;
}

function addDays(date: Date, days: number) {
    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + days);
    return nextDate;
}

function formatDateKey(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

export function getMonthScheduleQuery(date: Date) {
    return getMonthDateTimeRange(date, { timeZone: SCHEDULE_TIME_ZONE });
}

export function getScheduleMonthKey(date: Date) {
    return formatMonthKey(date, { timeZone: SCHEDULE_TIME_ZONE });
}

export function parseScheduleMonthKey(monthKey: string) {
    return parseMonthKey(monthKey) ?? new Date();
}

export function getMonthScheduleQueryByMonthKey(monthKey: string) {
    const monthDate = parseMonthKey(monthKey);

    if (!monthDate) {
        return getMonthScheduleQuery(new Date());
    }

    const year = monthDate.getFullYear();
    const month = monthDate.getMonth() + 1;
    const monthPart = String(month).padStart(2, "0");
    const lastDay = new Date(year, month, 0).getDate();

    return {
        from: `${year}-${monthPart}-01 00:00:00`,
        to: `${year}-${monthPart}-${String(lastDay).padStart(2, "0")} 23:59:59`,
    };
}

function isValidScheduleDateTime(value: string) {
    return Boolean(value) && !Number.isNaN(new Date(value).getTime());
}

export function formatScheduleDateTime(value: string) {
    if (!isValidScheduleDateTime(value)) {
        return "-";
    }

    const valueForInput = formatDateTimeForInput(value, { timeZone: SCHEDULE_TIME_ZONE });
    const [datePart = "", timePart = ""] = valueForInput.split("T");
    const [year = "", month = "", day = ""] = datePart.split("-");
    const [hour = "", minute = ""] = timePart.split(":");

    return `${year}.${month}.${day} ${hour}:${minute}`;
}

export function formatScheduleTime(value: string) {
    if (!isValidScheduleDateTime(value)) {
        return "-";
    }

    const valueForInput = formatDateTimeForInput(value, { timeZone: SCHEDULE_TIME_ZONE });
    const [, timePart = ""] = valueForInput.split("T");
    const [hour = "", minute = ""] = timePart.split(":");

    return `${hour}:${minute}`;
}

function getScheduleDateParts(value: string) {
    if (!isValidScheduleDateTime(value)) {
        return null;
    }

    const valueForInput = formatDateTimeForInput(value, { timeZone: SCHEDULE_TIME_ZONE });
    const [datePart = "", timePart = ""] = valueForInput.split("T");
    const [year = "", month = "", day = ""] = datePart.split("-");
    const [hour = "", minute = ""] = timePart.split(":");
    const weekday = new Intl.DateTimeFormat("ko-KR", {
        weekday: "short",
        timeZone: SCHEDULE_TIME_ZONE,
    }).format(new Date(value));

    return {
        key: `${year}-${month}`,
        month: `${Number(month)}월`,
        monthLabel: `${year}년 ${Number(month)}월`,
        day,
        weekday,
        date: `${year}.${month}.${day}`,
        time: `${hour}:${minute}`,
    };
}

export function formatScheduleDateBadge(value: string) {
    const parts = getScheduleDateParts(value);

    if (!parts) {
        return { month: "-", day: "-", weekday: "-" };
    }

    return {
        month: parts.month,
        day: parts.day,
        weekday: parts.weekday,
    };
}

export function formatScheduleDateTimeRange(startAt: string, endAt: string) {
    const startDateTime = formatScheduleDateTime(startAt);
    const endDateTime = formatScheduleDateTime(endAt);

    if (startDateTime === "-" || endDateTime === "-") {
        return "-";
    }

    const [startDate = "", startTime = ""] = startDateTime.split(" ");
    const [endDate = "", endTime = ""] = endDateTime.split(" ");

    if (startDate === endDate) {
        return `${startDate} ${startTime} - ${endTime}`;
    }

    return `${startDateTime} - ${endDateTime}`;
}

export function groupSchedulesByMonth(schedules: ClubSchedule[], options: { preserveOrder?: boolean } = {}) {
    const groups = new Map<string, { key: string; label: string; schedules: ClubSchedule[] }>();
    const sourceSchedules = options.preserveOrder ? schedules : sortSchedulesByStartAt(schedules);

    for (const schedule of sourceSchedules) {
        const parts = getScheduleDateParts(schedule.startsAt);
        const key = parts?.key ?? "invalid";
        const label = parts?.monthLabel ?? "날짜 미정";
        const current = groups.get(key);

        if (current) {
            current.schedules.push(schedule);
            continue;
        }

        groups.set(key, {
            key,
            label,
            schedules: [schedule],
        });
    }

    return Array.from(groups.values());
}

export function getScheduleLocationLabel(location: string | null | undefined) {
    return location?.trim() || "장소 미정";
}

export function getScheduleDescriptionLabel(description: string | null | undefined) {
    return description?.trim() || "설명이 없습니다.";
}

export function getScheduleMetaText(values: Array<string | null | undefined>) {
    return values.map((value) => value?.trim()).filter(Boolean).join(" · ");
}

export function mapAdminClubScheduleToClubSchedule(schedule: AdminClubSchedule): ClubSchedule {
    return {
        id: schedule.id,
        clubId: schedule.club_id,
        clubName: schedule.club?.name ?? COMMON_CLUB_SCHEDULE_LABEL,
        category: schedule.club?.category ?? COMMON_CLUB_SCHEDULE_LABEL,
        title: schedule.title,
        type: schedule.type,
        startsAt: schedule.start_at,
        endsAt: schedule.end_at,
        isPublic: schedule.is_public,
        location: schedule.location ?? "",
        description: schedule.description ?? "",
        externalUrl: schedule.external_url ?? undefined,
    };
}

export function mapClubScheduleToClubSchedule(
    schedule: ApiClubSchedule,
    club?: Partial<Pick<ClubSchedule, "clubName" | "category">>
): ClubSchedule {
    const isCommonSchedule = schedule.club_id === null;

    return {
        id: schedule.id,
        clubId: schedule.club_id,
        clubName: club?.clubName ?? (isCommonSchedule ? COMMON_CLUB_SCHEDULE_LABEL : ""),
        category: club?.category ?? (isCommonSchedule ? COMMON_CLUB_SCHEDULE_LABEL : ""),
        title: schedule.title,
        type: schedule.type,
        startsAt: schedule.start_at,
        endsAt: schedule.end_at,
        isPublic: schedule.is_public,
        location: schedule.location ?? "",
        description: schedule.description ?? "",
        externalUrl: schedule.external_url ?? undefined,
    };
}

export function syncScheduleInVisibleMonth(
    schedules: ClubSchedule[],
    nextSchedule: ClubSchedule,
    visibleMonthKey: string
) {
    const visibleRange = getMonthScheduleQueryByMonthKey(visibleMonthKey);
    const nextSchedules = schedules.filter((schedule) => schedule.id !== nextSchedule.id);

    if (!isScheduleOverlappingDateRange(nextSchedule, visibleRange)) {
        return sortSchedulesByStartAt(nextSchedules);
    }

    return sortSchedulesByStartAt([...nextSchedules, nextSchedule]);
}

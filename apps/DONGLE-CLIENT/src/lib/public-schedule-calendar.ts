import type { AdminClubSchedule } from "@dongle/types/club/club.schedule";
import { COMMON_CLUB_SCHEDULE_LABEL } from "@dongle/types";
import {
    formatScheduleDisplayDateRange,
    formatScheduleDisplayDateTimeRange,
    getScheduleDisplayDateParts,
    type ScheduleDisplayItem,
} from "@dongle/ui/schedules/schedule-display";
import {
    formatDateForRequest,
    formatMonthKey,
    getCalendarGridDates,
    getDateTimeTimestamp,
    getMonthDateTimeRange,
    isDateKeyWithinRange,
    normalizeExternalUrl,
    parseMonthKey,
} from "@dongle/utils";
import type { ClubPublicSchedule } from "./club-schedule.types";

export const SCHEDULE_TIME_ZONE = "Asia/Seoul";

export function getScheduleCalendarDateKey(date: Date) {
    return formatDateForRequest(date, { timeZone: SCHEDULE_TIME_ZONE });
}

function getScheduleTimestamp(value: string) {
    return getDateTimeTimestamp(value, { timeZone: SCHEDULE_TIME_ZONE });
}

function getSortableScheduleTimestamp(value: string) {
    const timestamp = getScheduleTimestamp(value);

    return Number.isNaN(timestamp) ? Number.MAX_SAFE_INTEGER : timestamp;
}

export function getPublicScheduleMonthKey(month?: string | string[]) {
    const candidate = Array.isArray(month) ? month[0] : month;
    const parsed = candidate ? parseMonthKey(candidate) : null;

    return formatMonthKey(parsed ?? new Date(), { timeZone: SCHEDULE_TIME_ZONE });
}

export function getPublicScheduleMonthQuery(monthKey: string) {
    return getMonthDateTimeRange(parseMonthKey(monthKey) ?? new Date());
}

export function parsePublicScheduleMonthKey(monthKey: string) {
    return parseMonthKey(monthKey) ?? parseMonthKey(getPublicScheduleMonthKey()) ?? new Date();
}

export function getPublicScheduleCalendarDates(monthKey: string) {
    const visibleMonth = parsePublicScheduleMonthKey(monthKey);
    return getCalendarGridDates(visibleMonth.getFullYear(), visibleMonth.getMonth(), {
        timeZone: SCHEDULE_TIME_ZONE,
    });
}

export interface ScheduleCalendarCell {
    date: Date;
    dateKey: string;
    day: number;
    isCurrentMonth: boolean;
}

export function getScheduleCalendarCells(monthKey: string): ScheduleCalendarCell[] {
    return getPublicScheduleCalendarDates(monthKey).map((date) => {
        const dateKey = getScheduleCalendarDateKey(date);

        return {
            date,
            dateKey,
            day: Number(dateKey.slice(8, 10)),
            isCurrentMonth: dateKey.slice(0, 7) === monthKey,
        };
    });
}

export function getPublicSchedulesForDate(schedules: ClubPublicSchedule[], date: Date) {
    const dateKey = formatDateForRequest(date, { timeZone: SCHEDULE_TIME_ZONE });

    return sortPublicSchedulesByStartAt(
        schedules.filter((schedule) => {
            const startKey = formatDateForRequest(schedule.start_at, { timeZone: SCHEDULE_TIME_ZONE });
            const endKey = formatDateForRequest(schedule.end_at, { timeZone: SCHEDULE_TIME_ZONE });

            return isDateKeyWithinRange(dateKey, startKey, endKey);
        })
    );
}

export function sortPublicSchedulesByStartAt(schedules: ClubPublicSchedule[]) {
    return [...schedules].sort((a, b) => getSortableScheduleTimestamp(a.start_at) - getSortableScheduleTimestamp(b.start_at));
}

export function mapPublicCalendarScheduleToPublicSchedule(schedule: AdminClubSchedule): ClubPublicSchedule {
    return {
        id: schedule.id,
        clubId: schedule.club_id,
        clubName: schedule.club?.name ?? COMMON_CLUB_SCHEDULE_LABEL,
        category: schedule.club?.category ?? COMMON_CLUB_SCHEDULE_LABEL,
        title: schedule.title,
        type: schedule.type,
        start_at: schedule.start_at,
        end_at: schedule.end_at,
        is_public: schedule.is_public,
        location: schedule.location ?? "",
        description: schedule.description ?? "",
        external_url: normalizeExternalUrl(schedule.external_url),
    };
}

export function mapPublicScheduleToDisplayItem(schedule: ClubPublicSchedule): ScheduleDisplayItem<ClubPublicSchedule> {
    const dateParts = getScheduleDisplayDateParts(schedule.start_at);

    return {
        id: schedule.id,
        title: schedule.title,
        type: schedule.type,
        typeLabel: {
            recruitment: "모집",
            event: "행사",
            regular_meeting: "정기모임",
        }[schedule.type],
        dateKey: dateParts.dateKey,
        monthKey: dateParts.monthKey,
        monthLabel: dateParts.monthLabel,
        dateBadge: {
            month: dateParts.month,
            day: dateParts.day,
            weekday: dateParts.weekday,
            dateTime: schedule.start_at,
        },
        dateTimeLabel: formatScheduleDisplayDateTimeRange(schedule.start_at, schedule.end_at),
        compactDateTimeLabel: formatScheduleDisplayDateRange(schedule.start_at, schedule.end_at),
        locationLabel: schedule.location || undefined,
        descriptionLabel: schedule.description || undefined,
        externalUrl: schedule.external_url,
        clubName: schedule.clubName ?? COMMON_CLUB_SCHEDULE_LABEL,
        payload: schedule,
    };
}

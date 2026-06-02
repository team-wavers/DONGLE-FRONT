import type { AdminClubSchedule } from "@dongle/types/club/club.schedule";
import { COMMON_CLUB_SCHEDULE_LABEL } from "@dongle/types";
import {
    formatScheduleDisplayDateRange,
    formatScheduleDisplayDateTimeRange,
    getScheduleDisplayDateParts,
    type ScheduleDisplayItem,
} from "@dongle/ui/schedules/schedule-display";
import { formatMonthKey, getDateTimeTimestamp, getMonthDateTimeRange, normalizeExternalUrl, parseMonthKey } from "@dongle/utils";
import type { ClubPublicSchedule } from "./club-schedule.types";

const SCHEDULE_TIME_ZONE = "Asia/Seoul";

function getDateKey(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function getDayTimestampRange(date: Date) {
    const dateKey = getDateKey(date);

    return {
        from: getDateTimeTimestamp(`${dateKey} 00:00:00`, { timeZone: SCHEDULE_TIME_ZONE }),
        to: getDateTimeTimestamp(`${dateKey} 23:59:59`, { timeZone: SCHEDULE_TIME_ZONE }),
    };
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
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const start = new Date(firstDay);
    start.setDate(firstDay.getDate() - firstDay.getDay());

    return Array.from({ length: 42 }, (_, index) => {
        const date = new Date(start);
        date.setDate(start.getDate() + index);
        return date;
    });
}

export function getPublicSchedulesForDate(schedules: ClubPublicSchedule[], date: Date) {
    const { from, to } = getDayTimestampRange(date);

    return sortPublicSchedulesByStartAt(
        schedules.filter((schedule) => {
            const startsAt = getScheduleTimestamp(schedule.start_at);
            const endsAt = getScheduleTimestamp(schedule.end_at);

            if (Number.isNaN(startsAt) || Number.isNaN(endsAt)) {
                return false;
            }

            return startsAt <= to && endsAt >= from;
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
        category: schedule.category ?? COMMON_CLUB_SCHEDULE_LABEL,
        payload: schedule,
    };
}

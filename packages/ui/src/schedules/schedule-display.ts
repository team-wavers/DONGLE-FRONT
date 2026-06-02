const SCHEDULE_DISPLAY_TIME_ZONE = "Asia/Seoul";
const TIME_ZONE_OFFSET_REGEXP = /[zZ]|[+-]\d{2}:?\d{2}$/;
const DATE_TIME_WITHOUT_TIME_ZONE_REGEXP =
    /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?$/;

export type ScheduleDisplayType = "recruitment" | "event" | "regular_meeting";

export interface ScheduleDisplayDateBadge {
    month: string;
    day: string;
    weekday: string;
    dateTime?: string;
}

export interface ScheduleDisplayDateParts extends ScheduleDisplayDateBadge {
    year: string;
    dateKey: string;
    monthKey: string;
    monthLabel: string;
}

export interface ScheduleDisplayItem<TPayload = unknown> {
    id: number | string;
    title: string;
    type: ScheduleDisplayType;
    typeLabel: string;
    dateKey: string;
    monthKey: string;
    monthLabel: string;
    dateBadge: ScheduleDisplayDateBadge;
    dateTimeLabel: string;
    compactDateTimeLabel?: string;
    locationLabel?: string;
    descriptionLabel?: string;
    externalUrl?: string | null;
    clubName?: string;
    category?: string;
    isPublic?: boolean;
    payload?: TPayload;
}

export interface ScheduleDisplayMonthGroup<TPayload = unknown> {
    key: string;
    label: string;
    items: ScheduleDisplayItem<TPayload>[];
}

function getMonthIndexFromKey(monthKey: string) {
    const match = /^(\d{4})-(\d{2})$/.exec(monthKey);

    if (!match) {
        return null;
    }

    const [, year = "", month = ""] = match;
    const monthNumber = Number(month);

    if (!Number.isInteger(monthNumber) || monthNumber < 1 || monthNumber > 12) {
        return null;
    }

    return Number(year) * 12 + monthNumber - 1;
}

function getMonthIndexFromDate(date: Date) {
    if (Number.isNaN(date.getTime())) {
        return null;
    }

    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: SCHEDULE_DISPLAY_TIME_ZONE,
        year: "numeric",
        month: "2-digit",
    }).formatToParts(date);
    const partMap = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    const year = Number(partMap.year);
    const month = Number(partMap.month);

    if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
        return null;
    }

    return year * 12 + month - 1;
}

interface ScheduleDateTimeParts {
    year: string;
    month: string;
    day: string;
    hour: string;
    minute: string;
}

function getLocalDateTimeStringParts(value: string): ScheduleDateTimeParts | null {
    if (TIME_ZONE_OFFSET_REGEXP.test(value)) {
        return null;
    }

    const match = DATE_TIME_WITHOUT_TIME_ZONE_REGEXP.exec(value);

    if (!match) {
        return null;
    }

    const [, year = "", month = "", day = "", hour = "", minute = "", second = "00"] = match;
    const normalizedDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second)));

    if (
        normalizedDate.getUTCFullYear() !== Number(year) ||
        normalizedDate.getUTCMonth() + 1 !== Number(month) ||
        normalizedDate.getUTCDate() !== Number(day) ||
        normalizedDate.getUTCHours() !== Number(hour) ||
        normalizedDate.getUTCMinutes() !== Number(minute) ||
        normalizedDate.getUTCSeconds() !== Number(second)
    ) {
        return null;
    }

    return {
        year,
        month,
        day,
        hour,
        minute,
    };
}

function getScheduleDateTimeParts(value: string): ScheduleDateTimeParts | null {
    const localParts = getLocalDateTimeStringParts(value);

    if (localParts) {
        return localParts;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: SCHEDULE_DISPLAY_TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    }).formatToParts(date);
    const partMap = Object.fromEntries(parts.map((part) => [part.type, part.value]));

    return {
        year: partMap.year ?? "",
        month: partMap.month ?? "",
        day: partMap.day ?? "",
        hour: partMap.hour ?? "",
        minute: partMap.minute ?? "",
    };
}

function formatScheduleDate(parts: ScheduleDateTimeParts) {
    return `${Number(parts.month)}월 ${Number(parts.day)}일`;
}

function formatScheduleTime(parts: ScheduleDateTimeParts) {
    if (parts.hour === "00" && parts.minute === "00") {
        return "";
    }

    return `${parts.hour}시 ${parts.minute}분`;
}

function formatDateWithOptionalTime(parts: ScheduleDateTimeParts) {
    const date = formatScheduleDate(parts);
    const time = formatScheduleTime(parts);

    return time ? `${date} ${time}` : date;
}

function isSameScheduleDate(a: ScheduleDateTimeParts, b: ScheduleDateTimeParts) {
    return a.year === b.year && a.month === b.month && a.day === b.day;
}

function formatScheduleWeekday(parts: ScheduleDateTimeParts) {
    const date = new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)));

    return new Intl.DateTimeFormat("ko-KR", {
        timeZone: "UTC",
        weekday: "short",
    }).format(date);
}

export function getScheduleDisplayDateParts(value: string): ScheduleDisplayDateParts {
    const dateParts = getScheduleDateTimeParts(value);

    if (!dateParts) {
        return {
            year: "",
            month: "-",
            day: "-",
            weekday: "",
            dateKey: "invalid-date",
            monthKey: "invalid-date",
            monthLabel: "날짜 미정",
        };
    }

    const weekday = formatScheduleWeekday(dateParts);
    const monthNumber = Number(dateParts.month);

    return {
        year: dateParts.year,
        month: `${monthNumber}월`,
        day: dateParts.day,
        weekday,
        dateKey: `${dateParts.year}-${dateParts.month}-${dateParts.day}`,
        monthKey: `${dateParts.year}-${dateParts.month}`,
        monthLabel: `${dateParts.year}년 ${monthNumber}월`,
    };
}

export function formatScheduleDisplayDateTime(value: string) {
    const parts = getScheduleDateTimeParts(value);

    if (!parts) {
        return "-";
    }

    return formatDateWithOptionalTime(parts);
}

export function formatScheduleDisplayDateTimeRange(startAt: string, endAt: string) {
    const start = getScheduleDateTimeParts(startAt);
    const end = getScheduleDateTimeParts(endAt);

    if (!start || !end) {
        return "-";
    }

    const startDate = formatScheduleDate(start);
    const endDate = formatScheduleDate(end);
    const startTime = formatScheduleTime(start);
    const endTime = formatScheduleTime(end);

    if (isSameScheduleDate(start, end)) {
        if (!startTime && !endTime) {
            return startDate;
        }

        if (!startTime) {
            return `${startDate} - ${endTime}`;
        }

        if (!endTime) {
            return `${startDate} ${startTime}`;
        }

        return `${startDate} ${startTime} - ${endTime}`;
    }

    return `${formatDateWithOptionalTime(start)} - ${formatDateWithOptionalTime(end)}`;
}

export function formatScheduleDisplayDateRange(startAt: string, endAt: string) {
    const start = getScheduleDateTimeParts(startAt);
    const end = getScheduleDateTimeParts(endAt);

    if (!start || !end) {
        return "-";
    }

    const startDate = formatScheduleDate(start);
    const endDate = formatScheduleDate(end);

    if (isSameScheduleDate(start, end)) {
        return startDate;
    }

    return `${startDate} - ${endDate}`;
}

export function groupScheduleDisplayItemsByMonth<TPayload = unknown>(
    items: ScheduleDisplayItem<TPayload>[]
): ScheduleDisplayMonthGroup<TPayload>[] {
    const groups = new Map<string, ScheduleDisplayMonthGroup<TPayload>>();

    for (const item of items) {
        const currentGroup = groups.get(item.monthKey);

        if (currentGroup) {
            currentGroup.items.push(item);
            continue;
        }

        groups.set(item.monthKey, {
            key: item.monthKey,
            label: item.monthLabel,
            items: [item],
        });
    }

    return Array.from(groups.values());
}

export function sortScheduleDisplayMonthGroupsByDistance<TPayload = unknown>(
    groups: ScheduleDisplayMonthGroup<TPayload>[],
    referenceDate: Date
): ScheduleDisplayMonthGroup<TPayload>[] {
    const referenceMonthIndex = getMonthIndexFromDate(referenceDate);

    if (referenceMonthIndex === null) {
        return groups;
    }

    return groups
        .map((group, index) => ({
            group,
            index,
            monthIndex: getMonthIndexFromKey(group.key),
        }))
        .sort((a, b) => {
            if (a.monthIndex === null || b.monthIndex === null) {
                if (a.monthIndex === b.monthIndex) {
                    return a.index - b.index;
                }

                return a.monthIndex === null ? 1 : -1;
            }

            const aDistance = Math.abs(a.monthIndex - referenceMonthIndex);
            const bDistance = Math.abs(b.monthIndex - referenceMonthIndex);

            if (aDistance !== bDistance) {
                return aDistance - bDistance;
            }

            const aIsFuture = a.monthIndex >= referenceMonthIndex;
            const bIsFuture = b.monthIndex >= referenceMonthIndex;

            if (aIsFuture !== bIsFuture) {
                return aIsFuture ? -1 : 1;
            }

            return a.index - b.index;
        })
        .map(({ group }) => group);
}

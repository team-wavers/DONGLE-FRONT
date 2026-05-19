import type {
    AdminClubSchedule,
    ClubSchedule as ApiClubSchedule,
    CreateClubScheduleRequest,
} from "@dongle/types/club/club.schedule";
import {
    formatDateForRequest,
    formatDateTimeForInput,
    formatDateTimeForRequest,
    getMonthDateTimeRange,
    normalizeExternalUrl,
} from "@dongle/utils";
import type { ClubSchedule, ScheduleType } from "./schedule.types";

const SCHEDULE_TIME_ZONE = "Asia/Seoul";
const SCHEDULE_EXTERNAL_URL_ERROR = "외부 링크는 http 또는 https URL로 입력해주세요.";

export interface ScheduleFilters {
    keyword: string;
    category: string;
    type: "all" | ScheduleType;
    isPublic: "all" | boolean;
}

export interface ClubSchedulePayloadForm {
    title: string | null | undefined;
    type: ScheduleType;
    startsAt: string;
    endsAt: string;
    location: string | null | undefined;
    description: string | null | undefined;
    isPublic: boolean;
    externalUrl?: string | null | undefined;
}

function toSchedulePayloadText(value: string | null | undefined) {
    return value?.trim() ?? "";
}

export function getScheduleExternalUrlError(value: string | null | undefined) {
    const trimmedValue = value?.trim();

    if (!trimmedValue) {
        return null;
    }

    return normalizeExternalUrl(trimmedValue) ? null : SCHEDULE_EXTERNAL_URL_ERROR;
}

function getScheduleExternalUrlPayloadValue(value: string | null | undefined) {
    const trimmedValue = value?.trim();

    if (!trimmedValue) {
        return "";
    }

    const normalizedUrl = normalizeExternalUrl(trimmedValue);

    if (!normalizedUrl) {
        throw new Error(SCHEDULE_EXTERNAL_URL_ERROR);
    }

    return normalizedUrl;
}

export function buildClubSchedulePayload(form: ClubSchedulePayloadForm): CreateClubScheduleRequest {
    return {
        title: toSchedulePayloadText(form.title),
        type: form.type,
        start_at: formatDateTimeForRequest(form.startsAt),
        end_at: formatDateTimeForRequest(form.endsAt),
        is_public: form.isPublic,
        location: toSchedulePayloadText(form.location),
        description: toSchedulePayloadText(form.description),
        external_url: getScheduleExternalUrlPayloadValue(form.externalUrl),
    };
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
    return (
        formatDateForRequest(a, { timeZone: SCHEDULE_TIME_ZONE }) ===
        formatDateForRequest(b, { timeZone: SCHEDULE_TIME_ZONE })
    );
}

export function getSchedulesForDate(schedules: ClubSchedule[], date: Date) {
    return schedules.filter((schedule) => isSameCalendarDate(new Date(schedule.startsAt), date));
}

export function filterSchedules(schedules: ClubSchedule[], filters: ScheduleFilters) {
    const keyword = filters.keyword.trim().toLowerCase();

    return schedules.filter((schedule) => {
        const searchableText = [schedule.title, schedule.clubName, schedule.category, schedule.location]
            .join(" ")
            .toLowerCase();

        return (
            (!keyword || searchableText.includes(keyword)) &&
            (filters.category === "all" || schedule.category === filters.category) &&
            (filters.type === "all" || schedule.type === filters.type) &&
            (filters.isPublic === "all" || schedule.isPublic === filters.isPublic)
        );
    });
}

export function sortSchedulesByStartAt(schedules: ClubSchedule[]) {
    return [...schedules].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
}

export function getMonthScheduleQuery(date: Date) {
    return getMonthDateTimeRange(date, { timeZone: SCHEDULE_TIME_ZONE });
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
        clubName: schedule.club.name,
        category: schedule.club.category,
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
    return {
        id: schedule.id,
        clubId: schedule.club_id,
        clubName: club?.clubName ?? "",
        category: club?.category ?? "",
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

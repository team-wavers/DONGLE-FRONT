import type { ClubSchedule } from "@dongle/types/club/club.schedule";
import { normalizeExternalUrl } from "@dongle/utils";
import type { ClubPublicSchedule, ClubScheduleGroups } from "./club-schedule.types";

const SCHEDULE_TIME_ZONE = "Asia/Seoul";

interface GetClubScheduleGroupsOptions {
    clubId: number;
    now?: Date;
}

function sortByStartAt(schedules: ClubPublicSchedule[]) {
    return [...schedules].sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());
}

function getScheduleDateTimeParts(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: SCHEDULE_TIME_ZONE,
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).formatToParts(date);
    const partMap = Object.fromEntries(parts.map((part) => [part.type, part.value]));

    return {
        month: partMap.month,
        day: partMap.day,
        hour: partMap.hour,
        minute: partMap.minute,
    };
}

export function getClubScheduleGroups(
    schedules: ClubPublicSchedule[],
    { clubId, now = new Date() }: GetClubScheduleGroupsOptions
): ClubScheduleGroups {
    const nowTime = now.getTime();
    const visibleSchedules = schedules.filter((schedule) => schedule.clubId === clubId && schedule.is_public);

    return {
        upcoming: sortByStartAt(visibleSchedules.filter((schedule) => new Date(schedule.end_at).getTime() >= nowTime)),
        past: sortByStartAt(visibleSchedules.filter((schedule) => new Date(schedule.end_at).getTime() < nowTime)),
    };
}

export function formatScheduleDateTime(value: string) {
    const parts = getScheduleDateTimeParts(value);

    if (!parts) {
        return "-";
    }

    return `${parts.month}.${parts.day} ${parts.hour}:${parts.minute}`;
}

export function formatScheduleDateTimeRange(startAt: string, endAt: string) {
    const start = getScheduleDateTimeParts(startAt);
    const end = getScheduleDateTimeParts(endAt);

    if (!start || !end) {
        return "-";
    }

    const startDate = `${start.month}.${start.day}`;
    const endDate = `${end.month}.${end.day}`;
    const startTime = `${start.hour}:${start.minute}`;
    const endTime = `${end.hour}:${end.minute}`;

    if (startDate === endDate) {
        return `${startDate} ${startTime} - ${endTime}`;
    }

    return `${startDate} ${startTime} - ${endDate} ${endTime}`;
}

export function mapClubScheduleToPublicSchedule(schedule: ClubSchedule): ClubPublicSchedule {
    return {
        id: schedule.id,
        clubId: schedule.club_id,
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

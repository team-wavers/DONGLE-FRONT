import type { ClubSchedule } from "@dongle/types/club/club.schedule";
import {
    formatScheduleDisplayDateRange,
    formatScheduleDisplayDateTime,
    formatScheduleDisplayDateTimeRange,
} from "@dongle/ui/schedules/schedule-display";
import { getDateTimeTimestamp, normalizeExternalUrl } from "@dongle/utils";
import type { ClubPublicSchedule, ClubScheduleGroups } from "./club-schedule.types";

const SCHEDULE_TIME_ZONE = "Asia/Seoul";

function getScheduleTimestamp(value: string) {
    return getDateTimeTimestamp(value, { timeZone: SCHEDULE_TIME_ZONE });
}

function getSortableScheduleTimestamp(value: string) {
    const timestamp = getScheduleTimestamp(value);

    return Number.isNaN(timestamp) ? Number.MAX_SAFE_INTEGER : timestamp;
}

interface GetClubScheduleGroupsOptions {
    clubId: number;
    now?: Date;
}

function sortByStartAt(schedules: ClubPublicSchedule[]) {
    return [...schedules].sort((a, b) => getSortableScheduleTimestamp(a.start_at) - getSortableScheduleTimestamp(b.start_at));
}

function sortByEndAt(schedules: ClubPublicSchedule[]) {
    return [...schedules].sort((a, b) => getSortableScheduleTimestamp(a.end_at) - getSortableScheduleTimestamp(b.end_at));
}

function getScheduleDistanceFromNow(schedule: ClubPublicSchedule, nowTime: number) {
    const startTime = getSortableScheduleTimestamp(schedule.start_at);
    const endTime = getSortableScheduleTimestamp(schedule.end_at);

    if (startTime > nowTime) {
        return { distance: startTime - nowTime, priority: 0 };
    }

    return { distance: nowTime - endTime, priority: 1 };
}

function sortByDistanceFromNow(schedules: ClubPublicSchedule[], nowTime: number) {
    return [...schedules].sort((a, b) => {
        const aDistance = getScheduleDistanceFromNow(a, nowTime);
        const bDistance = getScheduleDistanceFromNow(b, nowTime);

        if (aDistance.distance !== bDistance.distance) {
            return aDistance.distance - bDistance.distance;
        }

        if (aDistance.priority !== bDistance.priority) {
            return aDistance.priority - bDistance.priority;
        }

        return getSortableScheduleTimestamp(a.start_at) - getSortableScheduleTimestamp(b.start_at);
    });
}

function isScheduleOngoing(schedule: ClubPublicSchedule, nowTime: number) {
    const startTime = getScheduleTimestamp(schedule.start_at);
    const endTime = getScheduleTimestamp(schedule.end_at);

    return startTime <= nowTime && endTime >= nowTime;
}

function isScheduleUpcoming(schedule: ClubPublicSchedule, nowTime: number) {
    return getScheduleTimestamp(schedule.start_at) > nowTime;
}

function isSchedulePast(schedule: ClubPublicSchedule, nowTime: number) {
    return getScheduleTimestamp(schedule.end_at) < nowTime;
}

export function getClubScheduleGroups(
    schedules: ClubPublicSchedule[],
    { clubId, now = new Date() }: GetClubScheduleGroupsOptions
): ClubScheduleGroups {
    const nowTime = now.getTime();
    const visibleSchedules = schedules.filter((schedule) => schedule.clubId === clubId && schedule.is_public);
    const ongoing = sortByEndAt(visibleSchedules.filter((schedule) => isScheduleOngoing(schedule, nowTime)));
    const upcoming = sortByStartAt(visibleSchedules.filter((schedule) => isScheduleUpcoming(schedule, nowTime)));
    const past = sortByDistanceFromNow(
        visibleSchedules.filter((schedule) => isSchedulePast(schedule, nowTime)),
        nowTime
    );

    return {
        ongoing,
        remaining: sortByDistanceFromNow([...upcoming, ...past], nowTime),
        upcoming,
        past,
    };
}

export const formatScheduleDateTime = formatScheduleDisplayDateTime;
export const formatScheduleDateTimeRange = formatScheduleDisplayDateTimeRange;
export const formatScheduleDateRange = formatScheduleDisplayDateRange;

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

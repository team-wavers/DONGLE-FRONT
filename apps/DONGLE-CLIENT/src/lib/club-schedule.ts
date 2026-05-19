import type { ClubSchedule } from "@dongle/types/club/club.schedule";
import type { ClubPublicSchedule, ClubScheduleGroups } from "./club-schedule.types";

interface GetClubScheduleGroupsOptions {
    clubId: number;
    now?: Date;
}

function sortByStartAt(schedules: ClubPublicSchedule[]) {
    return [...schedules].sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());
}

export function getClubScheduleGroups(
    schedules: ClubPublicSchedule[],
    { clubId, now = new Date() }: GetClubScheduleGroupsOptions
): ClubScheduleGroups {
    const nowTime = now.getTime();
    const visibleSchedules = schedules.filter((schedule) => schedule.clubId === clubId && schedule.is_public);

    return {
        upcoming: sortByStartAt(visibleSchedules.filter((schedule) => new Date(schedule.start_at).getTime() >= nowTime)),
        past: sortByStartAt(visibleSchedules.filter((schedule) => new Date(schedule.start_at).getTime() < nowTime)),
    };
}

export function formatScheduleDateTime(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return new Intl.DateTimeFormat("ko-KR", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    })
        .format(date)
        .replace(/\. /g, ".")
        .replace(/\.$/, "");
}

export function mapClubScheduleToPublicSchedule(schedule: ClubSchedule, clubId: number): ClubPublicSchedule {
    return {
        id: schedule.id,
        clubId,
        title: schedule.title,
        type: schedule.type,
        start_at: schedule.start_at,
        end_at: schedule.end_at,
        is_public: schedule.is_public,
        location: schedule.location ?? "",
        description: schedule.description ?? "",
        external_url: schedule.external_url,
    };
}

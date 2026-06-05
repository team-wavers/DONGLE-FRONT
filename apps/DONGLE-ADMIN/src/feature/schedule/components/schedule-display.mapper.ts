import {
    formatScheduleDisplayDateRange,
    formatScheduleDisplayDateTimeRange,
    getScheduleDisplayDateParts,
    type ScheduleDisplayItem,
} from "@dongle/ui/schedules/schedule-display";
import type { ClubSchedule } from "../schedule.types";
import { SCHEDULE_TYPE_LABELS } from "../schedule.types";
import { getScheduleDescriptionLabel, getScheduleLocationLabel } from "../schedule.utils";

export function mapScheduleToDisplayItem(schedule: ClubSchedule): ScheduleDisplayItem<ClubSchedule> {
    const dateParts = getScheduleDisplayDateParts(schedule.startsAt);

    return {
        id: schedule.id,
        title: schedule.title,
        type: schedule.type,
        typeLabel: SCHEDULE_TYPE_LABELS[schedule.type],
        dateKey: dateParts.dateKey,
        monthKey: dateParts.monthKey,
        monthLabel: dateParts.monthLabel,
        dateBadge: {
            month: dateParts.month,
            day: dateParts.day,
            weekday: dateParts.weekday,
            dateTime: schedule.startsAt,
        },
        dateTimeLabel: formatScheduleDisplayDateTimeRange(schedule.startsAt, schedule.endsAt),
        compactDateTimeLabel: formatScheduleDisplayDateRange(schedule.startsAt, schedule.endsAt),
        locationLabel: getScheduleLocationLabel(schedule.location),
        descriptionLabel: getScheduleDescriptionLabel(schedule.description),
        externalUrl: schedule.externalUrl,
        clubName: schedule.clubName,
        isPublic: schedule.isPublic,
        payload: schedule,
    };
}

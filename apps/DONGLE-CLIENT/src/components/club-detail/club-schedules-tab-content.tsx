"use client";

import React from "react";
import type { ClubPublicSchedule, ClubPublicScheduleType, ClubScheduleGroups } from "@/lib/club-schedule.types";
import { trackDongleEvent } from "@/lib/analytics";
import { getDateTimeTimestamp } from "@dongle/utils";
import {
    formatScheduleDisplayDateRange,
    formatScheduleDisplayDateTimeRange,
    getScheduleDisplayDateParts,
    groupScheduleDisplayItemsByMonth,
    type ScheduleDisplayItem,
} from "@dongle/ui/schedules/schedule-display";
import { ScheduleDisplayMonthList, ScheduleDisplaySection } from "@dongle/ui/schedules/schedule-display-list";

interface ClubSchedulesTabContentProps {
    clubName: string;
    schedules: ClubScheduleGroups;
    loadFailed?: boolean;
}

const SCHEDULE_TYPE_LABELS: Record<ClubPublicScheduleType, string> = {
    recruitment: "모집",
    event: "행사",
    regular_meeting: "정기모임",
};

const SCHEDULE_TIME_ZONE = "Asia/Seoul";

function getScheduleStartTime(schedule: ClubPublicSchedule) {
    const time = getDateTimeTimestamp(schedule.start_at, { timeZone: SCHEDULE_TIME_ZONE });

    return Number.isNaN(time) ? Number.MAX_SAFE_INTEGER : time;
}

function mapScheduleToDisplayItem(schedule: ClubPublicSchedule): ScheduleDisplayItem<ClubPublicSchedule> {
    const dateParts = getScheduleDisplayDateParts(schedule.start_at);

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
            dateTime: schedule.start_at,
        },
        dateTimeLabel: formatScheduleDisplayDateTimeRange(schedule.start_at, schedule.end_at),
        compactDateTimeLabel: formatScheduleDisplayDateRange(schedule.start_at, schedule.end_at),
        locationLabel: schedule.location || undefined,
        descriptionLabel: schedule.description || undefined,
        externalUrl: schedule.external_url,
        payload: schedule,
    };
}

function mapSchedulesToDisplayItems(schedules: ClubPublicSchedule[], options: { preserveOrder?: boolean } = {}) {
    const sourceSchedules = options.preserveOrder
        ? schedules
        : [...schedules].sort((a, b) => getScheduleStartTime(a) - getScheduleStartTime(b));

    return sourceSchedules.map(mapScheduleToDisplayItem);
}

export default function ClubSchedulesTabContent({ clubName, schedules, loadFailed = false }: ClubSchedulesTabContentProps) {
    const hasSchedules = schedules.ongoing.length > 0 || schedules.upcoming.length > 0 || schedules.past.length > 0;
    const ongoingScheduleItems = schedules.ongoing.map(mapScheduleToDisplayItem);
    const remainingSchedules = schedules.remaining ?? [...schedules.upcoming, ...schedules.past];
    const remainingScheduleItems = mapSchedulesToDisplayItems(remainingSchedules, {
        preserveOrder: Boolean(schedules.remaining),
    });
    const scheduleMonthGroups = groupScheduleDisplayItemsByMonth(remainingScheduleItems);
    const handleExternalLinkClick = (item: ScheduleDisplayItem<ClubPublicSchedule>) => {
        const schedule = item.payload;

        if (!schedule || !item.externalUrl) {
            return;
        }

        trackDongleEvent("schedule_external_link_click", {
            club_id: schedule.clubId,
            club_name: clubName,
            destination: item.externalUrl,
        });
    };

    if (loadFailed) {
        return (
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 py-16 text-center text-zinc-500">
                일정을 불러오지 못했습니다. 잠시 후 다시 확인해주세요.
            </div>
        );
    }

    if (!hasSchedules) {
        return (
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 py-16 text-center text-zinc-500">
                등록된 공개 일정이 없습니다.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <ScheduleDisplaySection
                title="진행 중인 일정"
                items={ongoingScheduleItems}
                variant="active"
                onExternalLinkClick={handleExternalLinkClick}
            />
            <ScheduleDisplayMonthList groups={scheduleMonthGroups} onExternalLinkClick={handleExternalLinkClick} />
        </div>
    );
}

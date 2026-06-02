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
const INITIAL_VISIBLE_REMAINING_SCHEDULE_COUNT = 6;
const VISIBLE_REMAINING_SCHEDULE_INCREMENT = 6;

function getScheduleStartTime(schedule: ClubPublicSchedule) {
    const time = getDateTimeTimestamp(schedule.start_at, { timeZone: SCHEDULE_TIME_ZONE });

    return Number.isNaN(time) ? Number.MAX_SAFE_INTEGER : time;
}

function mapScheduleToDisplayItem(schedule: ClubPublicSchedule, statusLabel?: string): ScheduleDisplayItem<ClubPublicSchedule> {
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
        statusLabel,
        externalUrl: schedule.external_url,
        payload: schedule,
    };
}

function mapSchedulesToDisplayItems(schedules: ClubPublicSchedule[], statusLabelsByScheduleId: Map<number, string>) {
    return [...schedules]
        .sort((a, b) => getScheduleStartTime(a) - getScheduleStartTime(b))
        .map((schedule) => mapScheduleToDisplayItem(schedule, statusLabelsByScheduleId.get(schedule.id)));
}

export function getScheduleExternalLinkAnalyticsPayload(
    clubName: string,
    item: ScheduleDisplayItem<ClubPublicSchedule>
) {
    const schedule = item.payload;

    if (!schedule || !item.externalUrl) {
        return null;
    }

    return {
        club_id: schedule.clubId,
        club_name: clubName,
        destination: item.externalUrl,
    };
}

export default function ClubSchedulesTabContent({ clubName, schedules, loadFailed = false }: ClubSchedulesTabContentProps) {
    const hasSchedules = schedules.ongoing.length > 0 || schedules.upcoming.length > 0 || schedules.past.length > 0;
    const statusLabelsByScheduleId = React.useMemo(() => {
        const statusLabels = new Map<number, string>();

        for (const schedule of schedules.ongoing) {
            statusLabels.set(schedule.id, "진행중");
        }

        for (const schedule of schedules.upcoming) {
            statusLabels.set(schedule.id, "예정");
        }

        for (const schedule of schedules.past) {
            statusLabels.set(schedule.id, "마감");
        }

        return statusLabels;
    }, [schedules.ongoing, schedules.past, schedules.upcoming]);
    const ongoingScheduleItems = schedules.ongoing.map((schedule) =>
        mapScheduleToDisplayItem(schedule, statusLabelsByScheduleId.get(schedule.id))
    );
    const remainingSchedules = React.useMemo(
        () => schedules.remaining ?? [...schedules.upcoming, ...schedules.past],
        [schedules.past, schedules.remaining, schedules.upcoming]
    );
    const [visibleRemainingScheduleCount, setVisibleRemainingScheduleCount] = React.useState(
        INITIAL_VISIBLE_REMAINING_SCHEDULE_COUNT
    );
    const remainingScheduleItems = React.useMemo(
        () => mapSchedulesToDisplayItems(remainingSchedules, statusLabelsByScheduleId),
        [remainingSchedules, statusLabelsByScheduleId]
    );
    const visibleRemainingScheduleItems = remainingScheduleItems.slice(0, visibleRemainingScheduleCount);
    const scheduleMonthGroups = React.useMemo(
        () => groupScheduleDisplayItemsByMonth(visibleRemainingScheduleItems),
        [visibleRemainingScheduleItems]
    );
    const hiddenRemainingScheduleCount = Math.max(remainingScheduleItems.length - visibleRemainingScheduleItems.length, 0);
    const nextVisibleRemainingScheduleCount = Math.min(
        hiddenRemainingScheduleCount,
        VISIBLE_REMAINING_SCHEDULE_INCREMENT
    );
    const handleExternalLinkClick = (item: ScheduleDisplayItem<ClubPublicSchedule>) => {
        const payload = getScheduleExternalLinkAnalyticsPayload(clubName, item);

        if (!payload) {
            return;
        }

        trackDongleEvent("schedule_external_link_click", payload);
    };
    const handleShowMoreSchedules = React.useCallback(() => {
        setVisibleRemainingScheduleCount((currentCount) =>
            Math.min(currentCount + VISIBLE_REMAINING_SCHEDULE_INCREMENT, remainingScheduleItems.length)
        );
    }, [remainingScheduleItems.length]);

    React.useEffect(() => {
        setVisibleRemainingScheduleCount(INITIAL_VISIBLE_REMAINING_SCHEDULE_COUNT);
    }, [remainingSchedules]);

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
            {hiddenRemainingScheduleCount > 0 ? (
                <div className="flex justify-center">
                    <button
                        type="button"
                        aria-label={`남은 일정 ${nextVisibleRemainingScheduleCount}개 더보기`}
                        onClick={handleShowMoreSchedules}
                        className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-200 bg-white px-5 text-sm font-extrabold text-zinc-700 shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2">
                        일정 {nextVisibleRemainingScheduleCount}개 더보기
                    </button>
                </div>
            ) : null}
        </div>
    );
}

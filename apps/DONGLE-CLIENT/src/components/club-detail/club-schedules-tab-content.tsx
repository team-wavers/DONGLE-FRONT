"use client";

import React from "react";
import type { ClubPublicSchedule, ClubPublicScheduleType, ClubScheduleGroups } from "@/lib/club-schedule.types";
import { trackDongleEvent } from "@/lib/analytics";
import {
    formatScheduleDisplayDateRange,
    formatScheduleDisplayDateTimeRange,
    getScheduleDisplayDateParts,
    groupScheduleDisplayItemsByMonth,
    type ScheduleDisplayItem,
} from "@dongle/ui/schedules/schedule-display";
import {
    ScheduleDisplayItemContent,
    ScheduleDisplayMonthList,
} from "@dongle/ui/schedules/schedule-display-list";

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

function mapSchedulesToDisplayItems(schedules: ClubPublicSchedule[]) {
    return schedules.map(mapScheduleToDisplayItem);
}

function OngoingSchedulesPanel({
    items,
    onExternalLinkClick,
}: {
    items: ScheduleDisplayItem<ClubPublicSchedule>[];
    onExternalLinkClick: (item: ScheduleDisplayItem<ClubPublicSchedule>) => void;
}) {
    if (items.length === 0) {
        return null;
    }

    return (
        <section aria-label="진행 중인 일정" className="space-y-2">
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-extrabold text-zinc-950">지금 진행 중</h2>
                <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-extrabold text-zinc-500">
                    {items.length}개
                </span>
            </div>
            <ol className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
                {items.map((item) => (
                    <li key={item.id} className="border-b border-zinc-100 px-4 py-4 last:border-b-0">
                        <ScheduleDisplayItemContent item={item} onExternalLinkClick={onExternalLinkClick} />
                    </li>
                ))}
            </ol>
        </section>
    );
}

export default function ClubSchedulesTabContent({ clubName, schedules, loadFailed = false }: ClubSchedulesTabContentProps) {
    const hasSchedules = schedules.ongoing.length > 0 || schedules.upcoming.length > 0 || schedules.past.length > 0;
    const ongoingScheduleItems = schedules.ongoing.map(mapScheduleToDisplayItem);
    const upcomingScheduleItems = mapSchedulesToDisplayItems(schedules.upcoming);
    const pastScheduleItems = mapSchedulesToDisplayItems(schedules.past);
    const upcomingMonthGroups = groupScheduleDisplayItemsByMonth(upcomingScheduleItems);
    const pastMonthGroups = groupScheduleDisplayItemsByMonth(pastScheduleItems);
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
            <OngoingSchedulesPanel
                items={ongoingScheduleItems}
                onExternalLinkClick={handleExternalLinkClick}
            />
            {upcomingMonthGroups.length > 0 ? (
                <section aria-label="다가오는 일정" className="space-y-3">
                    <h2 className="text-sm font-extrabold text-foreground">다가오는 일정</h2>
                    <ScheduleDisplayMonthList
                        groups={upcomingMonthGroups}
                        ariaLabel="다가오는 일정 월별 목록"
                        onExternalLinkClick={handleExternalLinkClick}
                    />
                </section>
            ) : null}
            {pastMonthGroups.length > 0 ? (
                <section aria-label="지난 일정" className="space-y-3">
                    <h2 className="text-sm font-extrabold text-foreground">지난 일정</h2>
                    <ScheduleDisplayMonthList
                        groups={pastMonthGroups}
                        ariaLabel="지난 일정 월별 목록"
                        onExternalLinkClick={handleExternalLinkClick}
                    />
                </section>
            ) : null}
        </div>
    );
}

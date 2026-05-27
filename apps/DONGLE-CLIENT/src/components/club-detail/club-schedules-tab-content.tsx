"use client";

import React from "react";
import { CalendarDays, ExternalLink, MapPin } from "lucide-react";
import { formatScheduleDateTimeRange } from "@/lib/club-schedule";
import type { ClubPublicSchedule, ClubScheduleGroups, ClubPublicScheduleType } from "@/lib/club-schedule.types";
import { trackDongleEvent } from "@/lib/analytics";

interface ClubSchedulesTabContentProps {
    clubName: string;
    schedules: ClubScheduleGroups;
    loadFailed?: boolean;
}

const SCHEDULE_TYPE_LABELS: Record<ClubPublicScheduleType, string> = {
    recruitment: "모집",
    event: "행사",
    regular_meeting: "정기모임",
    notice: "공지",
};

function ScheduleTimelineItem({
    clubName,
    schedule,
    isLast,
}: {
    clubName: string;
    schedule: ClubPublicSchedule;
    isLast: boolean;
}) {
    return (
        <li className="relative grid grid-cols-[1rem_minmax(0,1fr)] gap-4">
            <div className="relative flex justify-center">
                <span className="mt-2 size-3 rounded-full border-2 border-white bg-zinc-900 shadow-sm" aria-hidden="true" />
                {!isLast ? <span className="absolute top-6 bottom-0 w-px bg-zinc-200" aria-hidden="true" /> : null}
            </div>
            <article className={isLast ? "pb-0" : "pb-8"}>
                <div className="flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1 text-sm font-semibold text-zinc-500">
                        <CalendarDays className="size-4" aria-hidden="true" />
                        {formatScheduleDateTimeRange(schedule.start_at, schedule.end_at)}
                    </span>
                    <span className="rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-bold text-zinc-700">
                        {SCHEDULE_TYPE_LABELS[schedule.type]}
                    </span>
                </div>
                <h3 className="mt-2 text-lg font-bold text-zinc-950">{schedule.title}</h3>
                {schedule.location ? (
                    <p className="mt-2 flex items-center gap-1 text-sm font-semibold text-zinc-600">
                        <MapPin className="size-4" aria-hidden="true" />
                        {schedule.location}
                    </p>
                ) : null}
                {schedule.description ? <p className="mt-3 text-sm leading-6 text-zinc-700">{schedule.description}</p> : null}
                {schedule.external_url ? (
                    <a
                        href={schedule.external_url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() =>
                            trackDongleEvent("schedule_external_link_click", {
                                club_id: schedule.clubId,
                                club_name: clubName,
                                destination: schedule.external_url ?? "",
                            })
                        }
                        className="mt-4 inline-flex h-9 items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-800 transition-colors hover:border-zinc-300 hover:bg-zinc-50">
                        <ExternalLink className="size-4" aria-hidden="true" />
                        자세히 보기
                    </a>
                ) : null}
            </article>
        </li>
    );
}

function ScheduleSection({
    clubName,
    title,
    schedules,
}: {
    clubName: string;
    title: string;
    schedules: ClubPublicSchedule[];
}) {
    if (schedules.length === 0) {
        return null;
    }

    return (
        <section className="space-y-3">
            <h2 className="text-2xl font-bold text-zinc-900">{title}</h2>
            <ol className="space-y-0">
                {schedules.map((schedule, index) => (
                    <ScheduleTimelineItem
                        clubName={clubName}
                        key={schedule.id}
                        schedule={schedule}
                        isLast={index === schedules.length - 1}
                    />
                ))}
            </ol>
        </section>
    );
}

export default function ClubSchedulesTabContent({
    clubName,
    schedules,
    loadFailed = false,
}: ClubSchedulesTabContentProps) {
    const hasSchedules = schedules.upcoming.length > 0 || schedules.past.length > 0;

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
        <div className="space-y-8">
            <ScheduleSection clubName={clubName} title="다가오는 일정" schedules={schedules.upcoming} />
            <ScheduleSection clubName={clubName} title="지난 일정" schedules={schedules.past} />
        </div>
    );
}

"use client";

import { CalendarDays, MapPin } from "lucide-react";
import { formatScheduleDateTime } from "@/lib/club-schedule";
import type { ClubPublicSchedule, ClubScheduleGroups, ClubPublicScheduleType } from "@/lib/club-schedule.types";

interface ClubSchedulesTabContentProps {
    schedules: ClubScheduleGroups;
}

const SCHEDULE_TYPE_LABELS: Record<ClubPublicScheduleType, string> = {
    recruitment: "모집",
    event: "행사",
    regular_meeting: "정기모임",
    notice: "공지",
};

function ScheduleTimelineItem({ schedule, isLast }: { schedule: ClubPublicSchedule; isLast: boolean }) {
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
                        {formatScheduleDateTime(schedule.start_at)} - {formatScheduleDateTime(schedule.end_at)}
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
            </article>
        </li>
    );
}

function ScheduleSection({ title, schedules }: { title: string; schedules: ClubPublicSchedule[] }) {
    if (schedules.length === 0) {
        return null;
    }

    return (
        <section className="space-y-3">
            <h2 className="text-2xl font-bold text-zinc-900">{title}</h2>
            <ol className="space-y-0">
                {schedules.map((schedule, index) => (
                    <ScheduleTimelineItem
                        key={schedule.id}
                        schedule={schedule}
                        isLast={index === schedules.length - 1}
                    />
                ))}
            </ol>
        </section>
    );
}

export default function ClubSchedulesTabContent({ schedules }: ClubSchedulesTabContentProps) {
    const hasSchedules = schedules.upcoming.length > 0 || schedules.past.length > 0;

    if (!hasSchedules) {
        return (
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 py-16 text-center text-zinc-500">
                등록된 공개 일정이 없습니다.
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <ScheduleSection title="다가오는 일정" schedules={schedules.upcoming} />
            <ScheduleSection title="지난 일정" schedules={schedules.past} />
        </div>
    );
}

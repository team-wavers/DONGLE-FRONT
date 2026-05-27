"use client";

import { Button } from "@dongle/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@dongle/ui/dropdown-menu";
import { cn } from "@dongle/ui/utils";
import { ExternalLink, EyeOff, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { memo } from "react";
import type { ClubSchedule } from "../schedule.types";
import {
    formatScheduleDateBadge,
    formatScheduleDateTimeRange,
    getScheduleDescriptionLabel,
    getScheduleLocationLabel,
    getScheduleMetaText,
} from "../schedule.utils";
import { ScheduleIsPublicBadge, ScheduleTypeBadge } from "./schedule-badges";

interface ScheduleListItemProps {
    schedule: ClubSchedule;
    metaItems?: Array<string | null | undefined>;
    className?: string;
    isPending?: boolean;
    onEdit?: (schedule: ClubSchedule) => void;
    onDelete?: (schedule: ClubSchedule) => void;
    onToggleVisibility?: (schedule: ClubSchedule) => void;
}

export const ScheduleListItem = memo(function ScheduleListItem({
    schedule,
    metaItems,
    className,
    isPending,
    onEdit,
    onDelete,
    onToggleVisibility,
}: ScheduleListItemProps) {
    const dateBadge = formatScheduleDateBadge(schedule.startsAt);
    const range = formatScheduleDateTimeRange(schedule.startsAt, schedule.endsAt);
    const meta = getScheduleMetaText([
        ...(metaItems ?? [schedule.clubName, schedule.category]),
        getScheduleLocationLabel(schedule.location),
    ]);

    return (
        <article
            className={cn(
                "grid gap-4 border-b border-zinc-100 bg-white px-4 py-4 transition-colors last:border-b-0 hover:bg-zinc-50/80 md:grid-cols-[4.75rem_minmax(0,1fr)_auto] md:items-start",
                className
            )}>
            <div className="flex items-center gap-3 md:block md:text-center">
                <div className="text-xs font-semibold text-zinc-500">{dateBadge.month}</div>
                <div className="text-3xl font-bold leading-none text-zinc-950 md:mt-1">{dateBadge.day}</div>
                <div className="text-xs font-semibold text-zinc-500 md:mt-1">{dateBadge.weekday}</div>
            </div>

            <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                    <ScheduleTypeBadge type={schedule.type} />
                    <ScheduleIsPublicBadge isPublic={schedule.isPublic} />
                </div>
                <div className="mt-2 flex min-w-0 flex-col gap-1 md:flex-row md:items-baseline md:gap-3">
                    <h3 className="truncate text-base font-bold text-zinc-950">{schedule.title}</h3>
                    <p className="shrink-0 text-sm font-semibold text-zinc-600">{range}</p>
                </div>
                <p className="mt-1 truncate text-sm text-zinc-500">{meta}</p>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-600">
                    {getScheduleDescriptionLabel(schedule.description)}
                </p>
            </div>

            <div className="flex items-center gap-2 justify-self-start md:justify-self-end">
                {onEdit ? (
                    <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        disabled={isPending}
                        onClick={() => onEdit(schedule)}
                        aria-label={`${schedule.title} 수정`}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                ) : null}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            disabled={isPending}
                            aria-label={`${schedule.title} 추가 작업`}>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {onToggleVisibility ? (
                            <DropdownMenuItem onSelect={() => onToggleVisibility(schedule)}>
                                <EyeOff className="h-4 w-4" />
                                {schedule.isPublic ? "비공개로 전환" : "공개로 전환"}
                            </DropdownMenuItem>
                        ) : null}
                        {schedule.externalUrl ? (
                            <DropdownMenuItem asChild>
                                <a href={schedule.externalUrl} target="_blank" rel="noreferrer">
                                    <ExternalLink className="h-4 w-4" />
                                    외부 링크 열기
                                </a>
                            </DropdownMenuItem>
                        ) : null}
                        {(onToggleVisibility || schedule.externalUrl) && onDelete ? <DropdownMenuSeparator /> : null}
                        {onDelete ? (
                            <DropdownMenuItem variant="destructive" onSelect={() => onDelete(schedule)}>
                                <Trash2 className="h-4 w-4" />
                                삭제
                            </DropdownMenuItem>
                        ) : null}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </article>
    );
});

"use client";

import { Button } from "@dongle/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@dongle/ui/dropdown-menu";
import { ScheduleDisplayItemContent } from "@dongle/ui/schedules/schedule-display-list";
import { cn } from "@dongle/ui/utils";
import { ExternalLink, EyeOff, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import React, { memo } from "react";
import type { ClubSchedule } from "../schedule.types";
import { mapScheduleToDisplayItem } from "./schedule-display.mapper";

interface ScheduleListItemProps {
    schedule: ClubSchedule;
    variant?: "default" | "admin";
    className?: string;
    isPending?: boolean;
    onEdit?: (schedule: ClubSchedule) => void;
    onDelete?: (schedule: ClubSchedule) => void;
    onToggleVisibility?: (schedule: ClubSchedule) => void;
}

export const ScheduleListItem = memo(function ScheduleListItem({
    schedule,
    variant = "default",
    className,
    isPending,
    onEdit,
    onDelete,
    onToggleVisibility,
}: ScheduleListItemProps) {
    const isAdminVariant = variant === "admin";
    const displayItem = mapScheduleToDisplayItem(schedule);
    const dateBadge = displayItem.dateBadge;
    const actions = (
        <>
            {onEdit ? (
                <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    disabled={isPending}
                    onClick={() => onEdit(schedule)}
                    className="cursor-pointer"
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
                        className="cursor-pointer"
                        aria-label={`${schedule.title} 추가 작업`}>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {onToggleVisibility ? (
                        <DropdownMenuItem className="cursor-pointer" onSelect={() => onToggleVisibility(schedule)}>
                            <EyeOff className="h-4 w-4" />
                            {schedule.isPublic ? "비공개로 전환" : "공개로 전환"}
                        </DropdownMenuItem>
                    ) : null}
                    {schedule.externalUrl ? (
                        <DropdownMenuItem asChild>
                            <a href={schedule.externalUrl} target="_blank" rel="noreferrer" className="cursor-pointer">
                                <ExternalLink className="h-4 w-4" />
                                외부 링크 열기
                            </a>
                        </DropdownMenuItem>
                    ) : null}
                    {(onToggleVisibility || schedule.externalUrl) && onDelete ? <DropdownMenuSeparator /> : null}
                    {onDelete ? (
                        <DropdownMenuItem
                            variant="destructive"
                            className="cursor-pointer"
                            onSelect={() => onDelete(schedule)}>
                            <Trash2 className="h-4 w-4" />
                            삭제
                        </DropdownMenuItem>
                    ) : null}
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );

    return (
        <div
            className={cn(
                isAdminVariant
                    ? "border-b border-zinc-100 bg-white px-4 py-4 transition-colors last:border-b-0 hover:bg-zinc-50/80"
                    : "grid gap-4 border-b border-zinc-100 bg-white px-4 py-4 transition-colors last:border-b-0 hover:bg-zinc-50/80 md:grid-cols-[4.75rem_minmax(0,1fr)_auto] md:items-start",
                className
            )}>
            {isAdminVariant ? null : (
                <time dateTime={dateBadge.dateTime} className="flex items-center gap-3 md:block md:text-center">
                    <div className="text-xs font-semibold text-zinc-500">{dateBadge.month}</div>
                    <div className="text-3xl font-bold leading-none text-zinc-950 md:mt-1">{dateBadge.day}</div>
                    <div className="text-xs font-semibold text-zinc-500 md:mt-1">{dateBadge.weekday}</div>
                </time>
            )}

            <ScheduleDisplayItemContent
                item={displayItem}
                showPublicBadge
                showClubMeta={isAdminVariant}
                showDateMarker={false}
                actions={actions}
            />
        </div>
    );
});

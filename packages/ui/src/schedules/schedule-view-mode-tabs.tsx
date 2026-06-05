"use client";

import { CalendarDays, ListChecks } from "lucide-react";
import * as React from "react";
import { TabsList, TabsTrigger } from "../tabs";
import { cn } from "../utils";

export type ScheduleViewMode = "calendar" | "list";

interface ScheduleViewModeTabsProps {
    calendarLabel?: string;
    listLabel?: string;
    className?: string;
    triggerClassName?: string;
}

export function ScheduleViewModeTabs({
    calendarLabel = "캘린더",
    listLabel = "목록",
    className,
    triggerClassName,
}: ScheduleViewModeTabsProps) {
    return (
        <TabsList className={cn("h-10", className)}>
            <TabsTrigger value="calendar" className={cn("px-4", triggerClassName)}>
                <CalendarDays className="h-4 w-4" />
                {calendarLabel}
            </TabsTrigger>
            <TabsTrigger value="list" className={cn("px-4", triggerClassName)}>
                <ListChecks className="h-4 w-4" />
                {listLabel}
            </TabsTrigger>
        </TabsList>
    );
}

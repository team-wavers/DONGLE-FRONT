"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@dongle/ui/button";
import { cn } from "@dongle/ui/utils";
import { CalendarDays } from "lucide-react";

export default function HeaderScheduleLink() {
    const pathname = usePathname();
    const isActive = pathname === "/schedules" || pathname.startsWith("/schedules/");

    return (
        <Button
            asChild
            variant={isActive ? "secondary" : "ghost"}
            size="sm"
            className={cn(
                "h-9 gap-1.5 px-2.5 text-zinc-700 hover:text-zinc-950 sm:px-3",
                isActive && "bg-zinc-100 text-zinc-950"
            )}>
            <Link href="/schedules" aria-current={isActive ? "page" : undefined} aria-label="전체 일정">
                <CalendarDays className="size-4" aria-hidden="true" />
                <span className="hidden text-sm font-bold sm:inline">전체 일정</span>
            </Link>
        </Button>
    );
}

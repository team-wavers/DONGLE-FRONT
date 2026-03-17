"use client";

import { cn } from "@dongle/ui";
import type { ClubFilterStatus } from "@/hooks/use-club-filters";

interface ClubFilterChipsProps {
    activeStatus: ClubFilterStatus;
    onStatusChange: (status: ClubFilterStatus) => void;
}

const filterOptions: { value: ClubFilterStatus; label: string }[] = [
    { value: "all", label: "전체" },
    { value: "recruiting", label: "모집중" },
    { value: "closed", label: "모집마감" },
];

export default function ClubFilterChips({ activeStatus, onStatusChange }: ClubFilterChipsProps) {
    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {filterOptions.map((option) => {
                const isActive = activeStatus === option.value;

                return (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => onStatusChange(option.value)}
                        className={cn(
                            "rounded-full px-5 py-2 text-sm font-semibold border transition-colors whitespace-nowrap",
                            isActive
                                ? "bg-zinc-700 border-zinc-700 text-white"
                                : "bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50"
                        )}
                        aria-pressed={isActive}>
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}

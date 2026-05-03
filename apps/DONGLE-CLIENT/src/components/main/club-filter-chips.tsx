"use client";

import { cn } from "@dongle/ui/utils";
import { getClubCategoryPresentation } from "@/components/main/club-category-presentation";
import type { ClubCategoryFilter, ClubFilterStatus } from "@/hooks/use-club-filters";

interface ClubFilterChipsProps {
    activeStatus: ClubFilterStatus;
    onStatusChange: (status: ClubFilterStatus) => void;
    activeCategory: ClubCategoryFilter;
    categoryOptions: string[];
    onCategoryChange: (category: ClubCategoryFilter) => void;
}

const filterOptions: { value: ClubFilterStatus; label: string }[] = [
    { value: "all", label: "전체" },
    { value: "recruiting", label: "모집중" },
    { value: "closed", label: "모집마감" },
];

export default function ClubFilterChips({
    activeStatus,
    onStatusChange,
    activeCategory,
    categoryOptions,
    onCategoryChange,
}: ClubFilterChipsProps) {
    const hasActiveFilter = activeStatus !== "all" || activeCategory !== "all";

    return (
        <div className="mt-5 space-y-5">
            <div>
                <div className="mb-2 text-sm font-bold text-zinc-400">모집여부</div>
                <div className="grid h-11 min-w-0 grid-cols-3 gap-1 rounded-md bg-zinc-100 p-1">
                    {filterOptions.map((option) => {
                        const isActive = activeStatus === option.value;

                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => onStatusChange(option.value)}
                                className={cn(
                                    "h-full rounded-md px-2 py-0 text-sm font-bold leading-none transition-colors whitespace-nowrap",
                                    isActive ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-500 hover:bg-white hover:text-zinc-700"
                                )}
                                aria-label={`모집여부: ${option.label}`}
                                aria-pressed={isActive}>
                                {option.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div>
                <div className="mb-2 text-sm font-bold text-zinc-400">분과</div>
                <div className="flex flex-wrap gap-2">
                    {categoryOptions.map((category) => {
                        const presentation = getClubCategoryPresentation(category);
                        const Icon = presentation.icon;
                        const isActive = activeCategory === category;

                        return (
                            <button
                                key={category}
                                type="button"
                                onClick={() => onCategoryChange(category)}
                                className={cn(
                                    "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-bold transition-colors",
                                    presentation.labelClassName,
                                    isActive ? "ring-2 ring-zinc-900/80 ring-offset-1" : "hover:border-zinc-300"
                                )}
                                aria-pressed={isActive}>
                                <Icon className="size-3.5" aria-hidden="true" />
                                {category}
                            </button>
                        );
                    })}
                    {hasActiveFilter ? (
                        <button
                            type="button"
                            onClick={() => {
                                onStatusChange("all");
                                onCategoryChange("all");
                            }}
                            className="rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-bold text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-800">
                            초기화
                        </button>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

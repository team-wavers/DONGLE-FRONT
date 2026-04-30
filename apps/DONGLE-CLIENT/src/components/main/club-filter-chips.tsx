"use client";

import { Select, SelectContent, SelectItem, SelectTrigger } from "@dongle/ui/select";
import { cn } from "@dongle/ui/utils";
import type { ClubCategoryFilter, ClubFilterStatus } from "@/hooks/use-club-filters";
import { getCategoryStyle } from "@/components/main/category-style";

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
        <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-1.5">
                <div className="text-xs font-semibold text-zinc-400">모집여부</div>
                <div className="grid h-12 min-w-0 grid-cols-3 gap-1 rounded-xl border border-zinc-200/80 bg-zinc-50 p-1 md:h-11">
                    {filterOptions.map((option) => {
                        const isActive = activeStatus === option.value;

                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => onStatusChange(option.value)}
                                className={cn(
                                    "h-full rounded-[10px] px-3 py-0 text-sm font-semibold leading-none transition-colors whitespace-nowrap",
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

            <div className="space-y-1.5">
                <div className="text-xs font-semibold text-zinc-400">분과</div>
                <div className="flex gap-2">
                    <Select value={activeCategory} onValueChange={(value) => onCategoryChange(value)}>
                        {(() => {
                            const activeCategoryStyle = activeCategory === "all" ? null : getCategoryStyle(activeCategory);
                            const ActiveCategoryIcon = activeCategoryStyle?.icon;

                            return (
                        <SelectTrigger
                            aria-label="분과 필터"
                            className="h-12 w-full rounded-xl border-zinc-200/80 bg-zinc-50 px-5 py-0 text-left text-sm font-semibold leading-none text-zinc-700 shadow-none data-[size=default]:h-12 md:h-11 md:data-[size=default]:h-11">
                            <span className="inline-flex min-w-0 items-center gap-1.5 truncate">
                                {ActiveCategoryIcon ? <ActiveCategoryIcon className="size-4 shrink-0" /> : null}
                                <span className="truncate">{activeCategory === "all" ? "전체 분과" : activeCategory}</span>
                            </span>
                        </SelectTrigger>
                            );
                        })()}
                        <SelectContent className="border-zinc-200 bg-white">
                            <SelectItem value="all">전체 분과</SelectItem>
                            {categoryOptions.map((category) => {
                                const categoryStyle = getCategoryStyle(category);
                                const CategoryIcon = categoryStyle.icon;

                                return (
                                    <SelectItem key={category} value={category}>
                                        <span className="inline-flex items-center gap-1.5">
                                            <span className={cn("inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs", categoryStyle.tone)}>
                                                <CategoryIcon className="size-3" />
                                                {category}
                                            </span>
                                        </span>
                                    </SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>
                    {hasActiveFilter ? (
                        <button
                            type="button"
                            onClick={() => {
                                onStatusChange("all");
                                onCategoryChange("all");
                            }}
                            className="h-12 shrink-0 rounded-xl border border-zinc-200/80 bg-white px-3 text-sm font-semibold text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-800 md:h-11">
                            초기화
                        </button>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

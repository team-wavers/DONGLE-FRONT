"use client";

import { Input } from "@dongle/ui/input";
import { cn } from "@dongle/ui/utils";
import { Search } from "lucide-react";
import ClubFilterChips from "@/components/main/club-filter-chips";
import type { ClubCategoryFilter, ClubFilterStatus } from "@/hooks/use-club-filters";

interface ClubSearchSectionProps {
    searchQuery: string;
    onSearchQueryChange: (query: string) => void;
    activeStatus: ClubFilterStatus;
    onStatusChange: (status: ClubFilterStatus) => void;
    activeCategory: ClubCategoryFilter;
    categoryOptions: string[];
    onCategoryChange: (category: ClubCategoryFilter) => void;
}

export default function ClubSearchSection({
    searchQuery,
    onSearchQueryChange,
    activeStatus,
    onStatusChange,
    activeCategory,
    categoryOptions,
    onCategoryChange,
}: ClubSearchSectionProps) {
    return (
        <aside
            id="club-search-section"
            className="sticky top-20 z-[5] max-h-[calc(100dvh-5rem)] self-start overflow-y-auto scroll-mt-24 rounded-lg border border-zinc-200 bg-white p-4">
            <div className="mb-2 text-sm font-bold text-zinc-400">검색</div>
            <div className="group relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-400 transition-colors group-focus-within:text-zinc-500" />
                <Input
                    value={searchQuery}
                    onChange={(event) => onSearchQueryChange(event.target.value)}
                    placeholder="동아리명, 분과를 입력해 보세요"
                    className={cn(
                        "h-11 rounded-md border-zinc-200 bg-zinc-50 pl-11 text-sm font-semibold text-zinc-700 shadow-none",
                        "placeholder:text-zinc-400 focus-visible:bg-white"
                    )}
                />
            </div>
            <ClubFilterChips
                activeStatus={activeStatus}
                onStatusChange={onStatusChange}
                activeCategory={activeCategory}
                categoryOptions={categoryOptions}
                onCategoryChange={onCategoryChange}
            />
        </aside>
    );
}

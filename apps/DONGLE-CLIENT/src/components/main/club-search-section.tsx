"use client";

import { Input } from "@dongle/ui/input";
import { Search } from "lucide-react";
import ClubFilterChips from "@/components/main/club-filter-chips";
import type { ClubFilterStatus } from "@/hooks/use-club-filters";

interface ClubSearchSectionProps {
    searchQuery: string;
    onSearchQueryChange: (query: string) => void;
    activeStatus: ClubFilterStatus;
    onStatusChange: (status: ClubFilterStatus) => void;
}

export default function ClubSearchSection({
    searchQuery,
    onSearchQueryChange,
    activeStatus,
    onStatusChange,
}: ClubSearchSectionProps) {
    return (
        <div id="club-search-section" className="flex flex-col gap-4 scroll-mt-24">
            <div className="group relative">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white to-zinc-50 shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition-all duration-200 group-focus-within:shadow-[0_12px_34px_rgba(59,130,246,0.10)]" />
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 size-6 text-zinc-400 transition-colors group-focus-within:text-zinc-500" />
                <Input
                    value={searchQuery}
                    onChange={(event) => onSearchQueryChange(event.target.value)}
                    placeholder="동아리명, 분과를 입력해 보세요"
                    className="relative h-14 rounded-xl border-zinc-200/80 bg-transparent pl-16 text-lg font-semibold text-zinc-700 placeholder:text-zinc-400"
                />
            </div>
            <ClubFilterChips activeStatus={activeStatus} onStatusChange={onStatusChange} />
        </div>
    );
}

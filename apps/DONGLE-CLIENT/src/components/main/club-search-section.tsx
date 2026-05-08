"use client";

import { Button } from "@dongle/ui/button";
import { Input } from "@dongle/ui/input";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@dongle/ui/sheet";
import { cn } from "@dongle/ui/utils";
import { Search, SlidersHorizontal, X } from "lucide-react";
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
    const hasActiveFilter = activeStatus !== "all" || activeCategory !== "all";
    const activeFilterCount = Number(activeStatus !== "all") + Number(activeCategory !== "all");

    return (
        <aside id="club-search-section" className="scroll-mt-24">
            <div className="space-y-3 md:hidden">
                <div className="flex min-w-0 gap-2">
                    <SearchInput searchQuery={searchQuery} onSearchQueryChange={onSearchQueryChange} />
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                type="button"
                                variant="outline"
                                className={cn(
                                    "h-11 shrink-0 border-zinc-200 px-3 text-zinc-700 shadow-none",
                                    hasActiveFilter && "border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white"
                                )}
                                aria-label={activeFilterCount > 0 ? `필터 ${activeFilterCount}개 적용됨` : "필터 열기"}>
                                <SlidersHorizontal className="size-4" aria-hidden="true" />
                                <span className="text-sm font-bold">필터</span>
                                {activeFilterCount > 0 ? <span className="text-xs font-bold">{activeFilterCount}</span> : null}
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="max-h-[86dvh] rounded-t-2xl bg-white p-0">
                            <SheetHeader className="border-b border-zinc-100 px-5 py-4 text-left">
                                <SheetTitle className="text-base font-bold text-zinc-900">필터</SheetTitle>
                                <SheetDescription className="sr-only">동아리 모집여부와 분과 조건을 선택합니다.</SheetDescription>
                            </SheetHeader>
                            <div className="overflow-y-auto px-5 pb-2">
                                <ClubFilterChips
                                    activeStatus={activeStatus}
                                    onStatusChange={onStatusChange}
                                    activeCategory={activeCategory}
                                    categoryOptions={categoryOptions}
                                    onCategoryChange={onCategoryChange}
                                />
                            </div>
                            <SheetFooter className="border-t border-zinc-100 px-5 py-4">
                                <SheetClose asChild>
                                    <Button type="button" className="h-11 bg-zinc-900 text-sm font-bold text-white hover:bg-zinc-800">
                                        적용
                                    </Button>
                                </SheetClose>
                            </SheetFooter>
                        </SheetContent>
                    </Sheet>
                </div>
                {hasActiveFilter ? (
                    <div className="flex flex-wrap items-center gap-2">
                        {activeStatus !== "all" ? (
                            <ActiveFilterChip label={activeStatus === "recruiting" ? "모집중" : "모집마감"} onClear={() => onStatusChange("all")} />
                        ) : null}
                        {activeCategory !== "all" ? <ActiveFilterChip label={activeCategory} onClear={() => onCategoryChange("all")} /> : null}
                    </div>
                ) : null}
            </div>

            <div className="hidden rounded-lg border border-zinc-200 bg-white p-4 md:sticky md:top-20 md:z-[5] md:block md:max-h-[calc(100dvh-5rem)] md:self-start md:overflow-y-auto">
                <div className="mb-2 text-sm font-bold text-zinc-400">검색</div>
                <SearchInput searchQuery={searchQuery} onSearchQueryChange={onSearchQueryChange} />
                <ClubFilterChips
                    activeStatus={activeStatus}
                    onStatusChange={onStatusChange}
                    activeCategory={activeCategory}
                    categoryOptions={categoryOptions}
                    onCategoryChange={onCategoryChange}
                />
            </div>
        </aside>
    );
}

interface SearchInputProps {
    searchQuery: string;
    onSearchQueryChange: (query: string) => void;
}

function SearchInput({ searchQuery, onSearchQueryChange }: SearchInputProps) {
    return (
        <div className="group relative min-w-0 flex-1">
            <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-zinc-500" />
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
    );
}

interface ActiveFilterChipProps {
    label: string;
    onClear: () => void;
}

function ActiveFilterChip({ label, onClear }: ActiveFilterChipProps) {
    return (
        <button
            type="button"
            onClick={onClear}
            className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-bold text-zinc-600">
            <span className="min-w-0 truncate">{label}</span>
            <X className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="sr-only">필터 해제</span>
        </button>
    );
}

"use client";

import React from "react";
import ClubListSection from "@/components/main/club-list-section";
import ClubSearchSection from "@/components/main/club-search-section";
import RecruitmentClosingSection from "@/components/main/recruitment-closing-section";
import { useClubFilters } from "@/hooks/use-club-filters";
import { getClosingSoonClubs } from "@/lib/recruitment";

type ClubListItemViewModel = {
    id: number;
    name: string;
    icon_url: string | null;
    category: string;
    tags: string[];
    is_recruiting: boolean;
    recruit_end: string | null;
};

interface ClubMainClientProps {
    clubs: ClubListItemViewModel[];
    clubsLoadFailed?: boolean;
}

export default function ClubMainClient({ clubs, clubsLoadFailed = false }: ClubMainClientProps) {
    const {
        searchInputValue,
        onSearchInputChange,
        onSearchInputCompositionStart,
        onSearchInputCompositionEnd,
        activeStatus,
        setActiveStatus,
        activeCategory,
        setActiveCategory,
        resetActiveFilters,
        categoryOptions,
        filteredClubs,
        summaryText,
        emptyState,
    } = useClubFilters(clubs);
    const closingSoonEntries = React.useMemo(() => getClosingSoonClubs(clubs), [clubs]);

    return (
        <>
            <RecruitmentClosingSection entries={closingSoonEntries} />
            <section className="grid grid-cols-1 gap-4 md:grid-cols-[280px_minmax(0,1fr)]">
                <ClubSearchSection
                    searchInputValue={searchInputValue}
                    onSearchInputChange={onSearchInputChange}
                    onSearchInputCompositionStart={onSearchInputCompositionStart}
                    onSearchInputCompositionEnd={onSearchInputCompositionEnd}
                    activeStatus={activeStatus}
                    onStatusChange={setActiveStatus}
                    activeCategory={activeCategory}
                    categoryOptions={categoryOptions}
                    onCategoryChange={setActiveCategory}
                    onResetFilters={resetActiveFilters}
                />
                <ClubListSection
                    clubs={filteredClubs}
                    summaryText={clubsLoadFailed ? "동아리 목록을 불러오지 못했습니다." : summaryText}
                    emptyStateMessage={emptyState.message}
                    loadFailed={clubsLoadFailed}
                />
            </section>
        </>
    );
}

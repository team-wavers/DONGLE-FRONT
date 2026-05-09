"use client";

import ClubListSection from "@/components/main/club-list-section";
import ClubMainHeroBannerCarousel from "@/components/main/club-main-hero-banner-carousel";
import ClubSearchSection from "@/components/main/club-search-section";
import { useClubFilters } from "@/hooks/use-club-filters";

type ClubListItemViewModel = {
    id: number;
    name: string;
    icon_url: string | null;
    category: string;
    tags: string[];
    is_recruiting: boolean;
};

interface ClubMainClientProps {
    clubs: ClubListItemViewModel[];
    bannerImageUrls: string[];
}

export default function ClubMainClient({ clubs, bannerImageUrls }: ClubMainClientProps) {
    const {
        searchQuery,
        setSearchQuery,
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

    return (
        <section className="space-y-6 py-6 md:py-10">
            <ClubMainHeroBannerCarousel imageUrls={bannerImageUrls} />
            <section className="grid gap-4 md:grid-cols-[280px_minmax(0,1fr)]">
                <ClubSearchSection
                    searchQuery={searchQuery}
                    onSearchQueryChange={setSearchQuery}
                    activeStatus={activeStatus}
                    onStatusChange={setActiveStatus}
                    activeCategory={activeCategory}
                    categoryOptions={categoryOptions}
                    onCategoryChange={setActiveCategory}
                    onResetFilters={resetActiveFilters}
                />
                <ClubListSection clubs={filteredClubs} summaryText={summaryText} emptyStateMessage={emptyState.message} />
            </section>
        </section>
    );
}

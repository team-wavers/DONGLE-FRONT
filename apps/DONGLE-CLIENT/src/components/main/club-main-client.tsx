"use client";

import ClubListSection from "@/components/main/club-list-section";
import ClubMainHeroBannerCarousel from "@/components/main/club-main-hero-banner-carousel";
import ClubSearchSection from "@/components/main/club-search-section";
import { useClubFilters } from "@/hooks/use-club-filters";

type ClubListItemViewModel = {
    id: number;
    name: string;
    category: string;
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
        filteredClubs,
        summaryText,
        emptyState,
    } = useClubFilters(clubs);

    return (
        <section className="py-8 md:py-12 space-y-8">
            <ClubMainHeroBannerCarousel imageUrls={bannerImageUrls} />
            <ClubSearchSection
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                activeStatus={activeStatus}
                onStatusChange={setActiveStatus}
            />
            <ClubListSection clubs={filteredClubs} summaryText={summaryText} emptyStateMessage={emptyState.message} />
        </section>
    );
}

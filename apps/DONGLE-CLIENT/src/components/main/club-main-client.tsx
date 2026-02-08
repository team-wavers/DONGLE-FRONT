"use client";

import ClubListSection from "@/components/main/club-list-section";
import ClubSearchSection from "@/components/main/club-search-section";
import { useClubFilters } from "@/hooks/use-club-filters";
import type { Club } from "@dongle/types";

interface ClubMainClientProps {
    clubs: Club[];
}

export default function ClubMainClient({ clubs }: ClubMainClientProps) {
    const {
        searchQuery,
        setSearchQuery,
        activeStatus,
        setActiveStatus,
        filteredClubs,
        summaryText,
    } = useClubFilters(clubs);

    return (
        <section className="py-8 md:py-12 space-y-8">
            <ClubSearchSection
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                activeStatus={activeStatus}
                onStatusChange={setActiveStatus}
            />
            <ClubListSection clubs={filteredClubs} summaryText={summaryText} />
        </section>
    );
}

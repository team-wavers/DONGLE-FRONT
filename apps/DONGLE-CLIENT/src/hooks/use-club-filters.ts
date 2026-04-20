"use client";

import { useMemo, useState } from "react";
import type { RecruitmentStatus } from "@dongle/ui/badges/recruitment-status-badge";

type ClubFilterItem = {
    id: number;
    name: string;
    category: string;
    is_recruiting: boolean;
};

export type ClubFilterStatus = "all" | RecruitmentStatus;

const toRecruitmentStatus = (isRecruiting: boolean): RecruitmentStatus => (isRecruiting ? "recruiting" : "closed");

export type { ClubFilterItem };

export function normalizeClubSearchQuery(searchQuery: string) {
    return searchQuery.trim().toLowerCase();
}

export function filterClubs(clubs: ClubFilterItem[], searchQuery: string, activeStatus: ClubFilterStatus) {
    const normalizedQuery = normalizeClubSearchQuery(searchQuery);

    return clubs.filter((club) => {
        const byStatus = activeStatus === "all" || toRecruitmentStatus(club.is_recruiting) === activeStatus;

        const bySearch =
            normalizedQuery.length === 0 ||
            club.name.toLowerCase().includes(normalizedQuery) ||
            club.category.toLowerCase().includes(normalizedQuery);

        return byStatus && bySearch;
    });
}

export function getClubSummaryText(
    activeStatus: ClubFilterStatus,
    totalCount: number,
    recruitingCount: number
) {
    const closedCount = totalCount - recruitingCount;

    if (activeStatus === "recruiting") {
        return `총 ${totalCount}개의 동아리 · 모집중 ${recruitingCount}개`;
    }

    if (activeStatus === "closed") {
        return `총 ${totalCount}개의 동아리 · 모집마감 ${closedCount}개`;
    }

    return `총 ${totalCount}개의 동아리가 있습니다.`;
}

export function useClubFilters(clubs: ClubFilterItem[]) {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeStatus, setActiveStatus] = useState<ClubFilterStatus>("all");

    const filteredClubs = useMemo(() => filterClubs(clubs, searchQuery, activeStatus), [activeStatus, clubs, searchQuery]);

    const totalCount = clubs.length;
    const recruitingCount = clubs.filter((club) => club.is_recruiting).length;
    const visibleCount = filteredClubs.length;
    const summaryText = useMemo(
        () => getClubSummaryText(activeStatus, totalCount, recruitingCount),
        [activeStatus, recruitingCount, totalCount]
    );

    return {
        searchQuery,
        setSearchQuery,
        activeStatus,
        setActiveStatus,
        filteredClubs,
        summaryText,
        totalCount,
        visibleCount,
    };
}

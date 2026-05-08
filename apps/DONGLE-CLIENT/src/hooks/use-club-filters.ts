"use client";

import { getClubSearchEmptyState } from "@/lib/club-search-empty-state";
import type { RecruitmentStatus } from "@dongle/ui/badges/recruitment-status-badge";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

type ClubFilterItem = {
    id: number;
    name: string;
    category: string;
    tags: string[];
    is_recruiting: boolean;
};

export type ClubFilterStatus = "all" | RecruitmentStatus;
export type ClubCategoryFilter = "all" | string;

const toRecruitmentStatus = (isRecruiting: boolean): RecruitmentStatus => (isRecruiting ? "recruiting" : "closed");
const clubFilterStatusValues = ["all", "recruiting", "closed"] as const satisfies readonly ClubFilterStatus[];
const clubFilterSearchParamKeys = {
    searchQuery: "q",
    activeStatus: "status",
    activeCategory: "category",
} as const;

type SearchParamReader = {
    get: (name: string) => string | null;
};

type ClubFilterSearchParams = {
    searchQuery: string;
    activeStatus: ClubFilterStatus;
    activeCategory: ClubCategoryFilter;
};

export type { ClubFilterItem };

export function normalizeClubSearchQuery(searchQuery: string) {
    return searchQuery.trim().toLowerCase();
}

function toClubFilterStatus(value: string | null): ClubFilterStatus {
    return clubFilterStatusValues.includes(value as ClubFilterStatus) ? (value as ClubFilterStatus) : "all";
}

export function parseClubFilterSearchParams(searchParams: SearchParamReader): ClubFilterSearchParams {
    return {
        searchQuery: searchParams.get(clubFilterSearchParamKeys.searchQuery)?.trim() ?? "",
        activeStatus: toClubFilterStatus(searchParams.get(clubFilterSearchParamKeys.activeStatus)),
        activeCategory: searchParams.get(clubFilterSearchParamKeys.activeCategory)?.trim() || "all",
    };
}

export function buildClubFilterSearchParams(
    filters: ClubFilterSearchParams,
    baseSearchParams: URLSearchParams = new URLSearchParams()
) {
    const nextSearchParams = new URLSearchParams(baseSearchParams);
    const searchQuery = filters.searchQuery.trim();
    const activeCategory = filters.activeCategory.trim();

    if (searchQuery.length > 0) {
        nextSearchParams.set(clubFilterSearchParamKeys.searchQuery, searchQuery);
    } else {
        nextSearchParams.delete(clubFilterSearchParamKeys.searchQuery);
    }

    if (filters.activeStatus !== "all") {
        nextSearchParams.set(clubFilterSearchParamKeys.activeStatus, filters.activeStatus);
    } else {
        nextSearchParams.delete(clubFilterSearchParamKeys.activeStatus);
    }

    if (activeCategory.length > 0 && activeCategory !== "all") {
        nextSearchParams.set(clubFilterSearchParamKeys.activeCategory, activeCategory);
    } else {
        nextSearchParams.delete(clubFilterSearchParamKeys.activeCategory);
    }

    return nextSearchParams;
}

export function getClubCategoryOptions(clubs: ClubFilterItem[]) {
    return Array.from(new Set(clubs.map((club) => club.category))).sort((left, right) =>
        left.localeCompare(right, "ko")
    );
}

export function filterClubs(
    clubs: ClubFilterItem[],
    searchQuery: string,
    activeStatus: ClubFilterStatus,
    activeCategory: ClubCategoryFilter
) {
    const normalizedQuery = normalizeClubSearchQuery(searchQuery);

    return clubs.filter((club) => {
        const byStatus = activeStatus === "all" || toRecruitmentStatus(club.is_recruiting) === activeStatus;
        const byCategory = activeCategory === "all" || club.category === activeCategory;

        const bySearch =
            normalizedQuery.length === 0 ||
            club.name.toLowerCase().includes(normalizedQuery) ||
            club.category.toLowerCase().includes(normalizedQuery);

        return byStatus && byCategory && bySearch;
    });
}

type ClubSummaryParams = {
    activeStatus: ClubFilterStatus;
    activeCategory: ClubCategoryFilter;
    searchQuery: string;
    totalCount: number;
    totalRecruitingCount: number;
    filteredCount: number;
    filteredRecruitingCount: number;
};

export function getClubSummaryText({
    activeStatus,
    activeCategory,
    searchQuery,
    totalCount,
    totalRecruitingCount,
    filteredCount,
    filteredRecruitingCount,
}: ClubSummaryParams) {
    const totalClosedCount = totalCount - totalRecruitingCount;
    const hasSearchQuery = normalizeClubSearchQuery(searchQuery).length > 0;
    const hasCategoryFilter = activeCategory !== "all";

    if (activeStatus === "recruiting") {
        const label = hasSearchQuery ? "검색 결과" : hasCategoryFilter ? activeCategory : "모집중";

        return `${label} ${filteredCount}개 · 전체 모집중 ${totalRecruitingCount}개`;
    }

    if (activeStatus === "closed") {
        const label = hasSearchQuery ? "검색 결과" : hasCategoryFilter ? activeCategory : "모집마감";

        return `${label} ${filteredCount}개 · 전체 모집마감 ${totalClosedCount}개`;
    }

    if (hasSearchQuery) {
        return `검색 결과 ${filteredCount}개 · 모집중 ${filteredRecruitingCount}개`;
    }

    if (hasCategoryFilter) {
        return `${activeCategory} ${filteredCount}개 · 모집중 ${filteredRecruitingCount}개`;
    }

    return `총 ${totalCount}개 · 모집중 ${totalRecruitingCount}개 · 모집마감 ${totalClosedCount}개`;
}

export function useClubFilters(clubs: ClubFilterItem[]) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { searchQuery, activeStatus, activeCategory } = useMemo(
        () => parseClubFilterSearchParams(searchParams),
        [searchParams]
    );
    const updateFilterSearchParams = useCallback(
        (nextFilters: Partial<ClubFilterSearchParams>) => {
            const nextSearchParams = buildClubFilterSearchParams(
                { searchQuery, activeStatus, activeCategory, ...nextFilters },
                new URLSearchParams(searchParams.toString())
            );
            const queryString = nextSearchParams.toString();

            window.history.replaceState(null, "", queryString ? `${pathname}?${queryString}` : pathname);
        },
        [activeCategory, activeStatus, pathname, searchParams, searchQuery]
    );
    const setSearchQuery = useCallback(
        (query: string) => updateFilterSearchParams({ searchQuery: query }),
        [updateFilterSearchParams]
    );
    const setActiveStatus = useCallback(
        (status: ClubFilterStatus) => updateFilterSearchParams({ activeStatus: status }),
        [updateFilterSearchParams]
    );
    const setActiveCategory = useCallback(
        (category: ClubCategoryFilter) => updateFilterSearchParams({ activeCategory: category }),
        [updateFilterSearchParams]
    );

    const categoryOptions = useMemo(() => getClubCategoryOptions(clubs), [clubs]);

    const filteredClubs = useMemo(
        () => filterClubs(clubs, searchQuery, activeStatus, activeCategory),
        [activeCategory, activeStatus, clubs, searchQuery]
    );

    const totalCount = clubs.length;
    const totalRecruitingCount = clubs.filter((club) => club.is_recruiting).length;
    const filteredCount = filteredClubs.length;
    const filteredRecruitingCount = filteredClubs.filter((club) => club.is_recruiting).length;
    const summaryText = useMemo(
        () =>
            getClubSummaryText({
                activeStatus,
                activeCategory,
                searchQuery,
                totalCount,
                totalRecruitingCount,
                filteredCount,
                filteredRecruitingCount,
            }),
        [
            activeCategory,
            activeStatus,
            filteredCount,
            filteredRecruitingCount,
            searchQuery,
            totalCount,
            totalRecruitingCount,
        ]
    );
    const emptyState = useMemo(
        () => getClubSearchEmptyState({ clubs, filteredClubs, searchQuery, activeStatus }),
        [activeStatus, clubs, filteredClubs, searchQuery]
    );

    return {
        searchQuery,
        setSearchQuery,
        activeStatus,
        setActiveStatus,
        activeCategory,
        setActiveCategory,
        categoryOptions,
        filteredClubs,
        summaryText,
        emptyState,
    };
}

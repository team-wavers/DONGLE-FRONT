"use client";

import { getClubSearchEmptyState } from "@/lib/club-search-empty-state";
import type { RecruitmentStatus } from "@dongle/ui/badges/recruitment-status-badge";
import { useDebouncedComposingValue } from "@dongle/ui/hooks/use-debounced-composing-value";
import { filterByKeyword, normalizeSearchQuery } from "@dongle/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

type ClubFilterItem = {
    id: number;
    name: string;
    icon_url?: string | null;
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
    return normalizeSearchQuery(searchQuery);
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

export function getClubRecruitingCounts(clubs: ClubFilterItem[], filteredClubs: ClubFilterItem[]) {
    let totalRecruitingCount = 0;
    let filteredRecruitingCount = 0;

    for (const club of clubs) {
        if (club.is_recruiting) {
            totalRecruitingCount += 1;
        }
    }

    for (const club of filteredClubs) {
        if (club.is_recruiting) {
            filteredRecruitingCount += 1;
        }
    }

    return {
        totalRecruitingCount,
        filteredRecruitingCount,
    };
}

export function filterClubs(
    clubs: ClubFilterItem[],
    searchQuery: string,
    activeStatus: ClubFilterStatus,
    activeCategory: ClubCategoryFilter
) {
    const byStatusAndCategory = clubs.filter((club) => {
        const byStatus = activeStatus === "all" || toRecruitmentStatus(club.is_recruiting) === activeStatus;
        const byCategory = activeCategory === "all" || club.category === activeCategory;

        return byStatus && byCategory;
    });

    return filterByKeyword(byStatusAndCategory, searchQuery, (club) => [club.name, club.category].join(" "));
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
    const router = useRouter();
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

            router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
        },
        [activeCategory, activeStatus, pathname, router, searchParams, searchQuery]
    );
    const commitSearchQuery = useCallback(
        (query: string) => updateFilterSearchParams({ searchQuery: query }),
        [updateFilterSearchParams]
    );
    const {
        value: searchInputValue,
        onChange: onSearchInputChange,
        onCompositionStart: onSearchInputCompositionStart,
        onCompositionEnd: onSearchInputCompositionEnd,
    } = useDebouncedComposingValue(searchQuery, commitSearchQuery);
    const setActiveStatus = useCallback(
        (status: ClubFilterStatus) => updateFilterSearchParams({ activeStatus: status }),
        [updateFilterSearchParams]
    );
    const setActiveCategory = useCallback(
        (category: ClubCategoryFilter) => updateFilterSearchParams({ activeCategory: category }),
        [updateFilterSearchParams]
    );
    const resetActiveFilters = useCallback(
        () => updateFilterSearchParams({ activeStatus: "all", activeCategory: "all" }),
        [updateFilterSearchParams]
    );

    const categoryOptions = useMemo(() => getClubCategoryOptions(clubs), [clubs]);

    const filteredClubs = useMemo(
        () => filterClubs(clubs, searchQuery, activeStatus, activeCategory),
        [activeCategory, activeStatus, clubs, searchQuery]
    );

    const totalCount = clubs.length;
    const filteredCount = filteredClubs.length;
    const { totalRecruitingCount, filteredRecruitingCount } = useMemo(
        () => getClubRecruitingCounts(clubs, filteredClubs),
        [clubs, filteredClubs]
    );
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
    };
}

"use client";

import { useMemo, useState } from "react";
import type { RecruitmentStatus } from "@dongle/ui";
import type { Club } from "@dongle/types";

export type ClubFilterStatus = "all" | RecruitmentStatus;

const toRecruitmentStatus = (isRecruiting: boolean): RecruitmentStatus => (isRecruiting ? "recruiting" : "closed");

export function useClubFilters(clubs: Club[]) {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeStatus, setActiveStatus] = useState<ClubFilterStatus>("all");

    const normalizedQuery = searchQuery.trim().toLowerCase();

    const filteredClubs = useMemo(() => {
        return clubs.filter((club) => {
            const byStatus = activeStatus === "all" || toRecruitmentStatus(club.is_recruiting) === activeStatus;

            const bySearch =
                normalizedQuery.length === 0 ||
                club.name.toLowerCase().includes(normalizedQuery) ||
                club.category.toLowerCase().includes(normalizedQuery);

            return byStatus && bySearch;
        });
    }, [activeStatus, clubs, normalizedQuery]);

    const totalCount = clubs.length;
    const recruitingCount = clubs.filter((club) => club.is_recruiting).length;
    const visibleCount = filteredClubs.length;
    const closedCount = totalCount - recruitingCount;

    const summaryText = useMemo(() => {
        if (activeStatus === "recruiting") {
            return `총 ${totalCount}개의 동아리 · 모집중 ${recruitingCount}개`;
        }

        if (activeStatus === "closed") {
            return `총 ${totalCount}개의 동아리 · 모집마감 ${closedCount}개`;
        }

        return `총 ${totalCount}개의 동아리가 있습니다.`;
    }, [activeStatus, closedCount, recruitingCount, totalCount]);

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

import type { ClubFilterItem, ClubFilterStatus } from "@/hooks/use-club-filters";

export type ClubSearchEmptyStateCode = "not-empty" | "no-result" | "no-open-recruitment" | "no-closed-recruitment";

export interface ClubSearchEmptyState {
    code: ClubSearchEmptyStateCode;
    message: string | null;
}

const EMPTY_STATE_MESSAGES: Record<Exclude<ClubSearchEmptyStateCode, "not-empty">, string> = {
    "no-result": "검색 결과가 없습니다.",
    "no-open-recruitment": "현재 모집중인 동아리가 없습니다.",
    "no-closed-recruitment": "현재 모집마감된 동아리가 없습니다.",
};

export function getClubSearchEmptyState(params: {
    clubs: ClubFilterItem[];
    filteredClubs: ClubFilterItem[];
    searchQuery: string;
    activeStatus: ClubFilterStatus;
}): ClubSearchEmptyState {
    const { clubs, filteredClubs, searchQuery, activeStatus } = params;

    if (filteredClubs.length > 0) {
        return { code: "not-empty", message: null };
    }

    const hasSearchQuery = searchQuery.trim().length > 0;
    if (hasSearchQuery || activeStatus === "all") {
        return { code: "no-result", message: EMPTY_STATE_MESSAGES["no-result"] };
    }

    const hasRecruitingClub = clubs.some((club) => club.is_recruiting);
    const hasClosedClub = clubs.some((club) => !club.is_recruiting);

    if (activeStatus === "recruiting" && !hasRecruitingClub) {
        return { code: "no-open-recruitment", message: EMPTY_STATE_MESSAGES["no-open-recruitment"] };
    }

    if (activeStatus === "closed" && !hasClosedClub) {
        return { code: "no-closed-recruitment", message: EMPTY_STATE_MESSAGES["no-closed-recruitment"] };
    }

    return { code: "no-result", message: EMPTY_STATE_MESSAGES["no-result"] };
}

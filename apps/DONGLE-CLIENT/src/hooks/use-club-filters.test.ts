import { expect, test } from "vitest";
import {
    filterClubs,
    getClubCategoryOptions,
    getClubSummaryText,
    type ClubFilterItem,
} from "./use-club-filters";

const clubs: ClubFilterItem[] = [
    { id: 1, name: "D-Maker", category: "학술", tags: ["개발"], is_recruiting: true },
    { id: 2, name: "Cinema", category: "문화", tags: ["영화"], is_recruiting: false },
    { id: 3, name: "Design Lab", category: "학술", tags: ["디자인"], is_recruiting: true },
];

test("filterClubs는 검색어를 trim/lowercase 기준으로 이름과 분과에 적용한다", () => {
    const result = filterClubs(clubs, "  design  ", "all", "all");

    expect(result.map((club) => club.id)).toEqual([3]);
});

test("filterClubs는 모집 상태와 검색어를 함께 적용한다", () => {
    const result = filterClubs(clubs, "학술", "recruiting", "all");

    expect(result.map((club) => club.id)).toEqual([1, 3]);
});

test("filterClubs는 분과 필터와 검색어를 함께 적용한다", () => {
    const result = filterClubs(clubs, "lab", "all", "학술");

    expect(result.map((club) => club.id)).toEqual([3]);
});

test("getClubCategoryOptions는 중복 없는 분과 목록을 정렬해서 반환한다", () => {
    expect(getClubCategoryOptions(clubs)).toEqual(["문화", "학술"]);
});

test("getClubSummaryText는 활성 상태에 따라 다른 요약 문구를 만든다", () => {
    const baseSummary = {
        activeStatus: "all" as const,
        activeCategory: "all",
        searchQuery: "",
        totalCount: 3,
        totalRecruitingCount: 2,
        filteredCount: 3,
        filteredRecruitingCount: 2,
    };

    expect(getClubSummaryText(baseSummary)).toBe("총 3개 · 모집중 2개 · 모집마감 1개");
    expect(
        getClubSummaryText({
            ...baseSummary,
            searchQuery: "design",
            filteredCount: 1,
            filteredRecruitingCount: 1,
        })
    ).toBe("검색 결과 1개 · 모집중 1개");
    expect(
        getClubSummaryText({
            ...baseSummary,
            activeCategory: "학술",
            filteredCount: 2,
            filteredRecruitingCount: 2,
        })
    ).toBe("학술 2개 · 모집중 2개");
    expect(
        getClubSummaryText({
            ...baseSummary,
            activeStatus: "recruiting",
            filteredCount: 2,
            filteredRecruitingCount: 2,
        })
    ).toBe("모집중 2개 · 전체 모집중 2개");
    expect(
        getClubSummaryText({
            ...baseSummary,
            activeStatus: "closed",
            filteredCount: 1,
            filteredRecruitingCount: 0,
        })
    ).toBe("모집마감 1개 · 전체 모집마감 1개");
});

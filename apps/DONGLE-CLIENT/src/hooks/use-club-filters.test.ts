import { expect, test } from "vitest";
import {
    filterClubs,
    getClubSummaryText,
    type ClubFilterItem,
    type ClubFilterStatus,
} from "./use-club-filters";

const clubs: ClubFilterItem[] = [
    { id: 1, name: "D-Maker", category: "학술", is_recruiting: true },
    { id: 2, name: "Cinema", category: "문화", is_recruiting: false },
    { id: 3, name: "Design Lab", category: "학술", is_recruiting: true },
];

test("filterClubs는 검색어를 trim/lowercase 기준으로 이름과 분과에 적용한다", () => {
    const result = filterClubs(clubs, "  design  ", "all");

    expect(result.map((club) => club.id)).toEqual([3]);
});

test("filterClubs는 모집 상태와 검색어를 함께 적용한다", () => {
    const result = filterClubs(clubs, "학술", "recruiting");

    expect(result.map((club) => club.id)).toEqual([1, 3]);
});

test("getClubSummaryText는 활성 상태에 따라 다른 요약 문구를 만든다", () => {
    expect(getClubSummaryText("all", 3, 2)).toBe("총 3개의 동아리가 있습니다.");
    expect(getClubSummaryText("recruiting", 3, 2)).toBe("총 3개의 동아리 · 모집중 2개");
    expect(getClubSummaryText("closed", 3, 2)).toBe("총 3개의 동아리 · 모집마감 1개");
});

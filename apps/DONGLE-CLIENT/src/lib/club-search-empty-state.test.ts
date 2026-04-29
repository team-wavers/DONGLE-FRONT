import { describe, expect, test } from "vitest";
import type { ClubFilterItem } from "@/hooks/use-club-filters";
import { getClubSearchEmptyState } from "./club-search-empty-state";

const mixedClubs: ClubFilterItem[] = [
    { id: 1, name: "D-Maker", category: "학술", is_recruiting: true },
    { id: 2, name: "Cinema", category: "문화", is_recruiting: false },
];

describe("getClubSearchEmptyState", () => {
    test("filteredClubs가 비어있지 않으면 not-empty를 반환한다", () => {
        const result = getClubSearchEmptyState({
            clubs: mixedClubs,
            filteredClubs: [mixedClubs[0]],
            searchQuery: "",
            activeStatus: "all",
        });

        expect(result).toEqual({ code: "not-empty", message: null });
    });

    test("검색어가 있으면 상태 필터와 무관하게 no-result를 반환한다", () => {
        const result = getClubSearchEmptyState({
            clubs: mixedClubs,
            filteredClubs: [],
            searchQuery: "  미존재  ",
            activeStatus: "recruiting",
        });

        expect(result).toEqual({ code: "no-result", message: "검색 결과가 없습니다." });
    });

    test("전체 필터에서 빈 결과면 no-result를 반환한다", () => {
        const result = getClubSearchEmptyState({
            clubs: mixedClubs,
            filteredClubs: [],
            searchQuery: "",
            activeStatus: "all",
        });

        expect(result).toEqual({ code: "no-result", message: "검색 결과가 없습니다." });
    });

    test("모집중 필터에서 모집중 데이터가 전혀 없으면 no-open-recruitment를 반환한다", () => {
        const result = getClubSearchEmptyState({
            clubs: [{ id: 2, name: "Cinema", category: "문화", is_recruiting: false }],
            filteredClubs: [],
            searchQuery: "",
            activeStatus: "recruiting",
        });

        expect(result).toEqual({
            code: "no-open-recruitment",
            message: "현재 모집중인 동아리가 없습니다.",
        });
    });

    test("모집마감 필터에서 모집마감 데이터가 전혀 없으면 no-closed-recruitment를 반환한다", () => {
        const result = getClubSearchEmptyState({
            clubs: [{ id: 1, name: "D-Maker", category: "학술", is_recruiting: true }],
            filteredClubs: [],
            searchQuery: "",
            activeStatus: "closed",
        });

        expect(result).toEqual({
            code: "no-closed-recruitment",
            message: "현재 모집마감된 동아리가 없습니다.",
        });
    });

    test("상태 데이터는 존재하지만 결과가 비면 no-result를 반환한다", () => {
        const result = getClubSearchEmptyState({
            clubs: mixedClubs,
            filteredClubs: [],
            searchQuery: "",
            activeStatus: "closed",
        });

        expect(result).toEqual({ code: "no-result", message: "검색 결과가 없습니다." });
    });
});

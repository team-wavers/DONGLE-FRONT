import { expect, test } from "vitest";
import { filterByKeyword, matchesKeyword, normalizeSearchQuery } from "./search";

test("normalizeSearchQuery는 공백과 대소문자를 정규화한다", () => {
    expect(normalizeSearchQuery("  DeSign  ")).toBe("design");
});

test("matchesKeyword는 keyword가 비어있으면 항상 true를 반환한다", () => {
    expect(matchesKeyword("아무 텍스트", "")).toBe(true);
    expect(matchesKeyword("아무 텍스트", "   ")).toBe(true);
});

test("matchesKeyword는 대소문자/공백을 무시하고 부분 일치를 확인한다", () => {
    expect(matchesKeyword("Design Lab", "  DESIGN  ")).toBe(true);
    expect(matchesKeyword("Design Lab", "music")).toBe(false);
});

test("filterByKeyword는 검색 가능한 텍스트를 기준으로 항목을 필터링한다", () => {
    const items = [
        { id: 1, name: "D-Maker", category: "학술" },
        { id: 2, name: "Cinema", category: "문화" },
        { id: 3, name: "Design Lab", category: "학술" },
    ];

    expect(filterByKeyword(items, "design", (item) => `${item.name} ${item.category}`).map((item) => item.id)).toEqual([
        3,
    ]);
    expect(filterByKeyword(items, "학술", (item) => `${item.name} ${item.category}`).map((item) => item.id)).toEqual([
        1, 3,
    ]);
});

test("filterByKeyword는 keyword가 비어있으면 전체 목록을 그대로 반환한다", () => {
    const items = [{ id: 1, name: "D-Maker" }];

    expect(filterByKeyword(items, "  ", (item) => item.name)).toBe(items);
});

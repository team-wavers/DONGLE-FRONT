import { expect, test } from "vitest";
import type { Club } from "@dongle/types/club/club.d";
import { filterClubsByKeyword, normalizeClubKeyword } from "./filterable-club-list";

const clubs = [
    {
        id: 1,
        name: "D-Maker",
        category: "학술분과",
        is_recruiting: true,
    },
    {
        id: 2,
        name: "Cinema",
        category: "문화분과",
        is_recruiting: false,
    },
    {
        id: 3,
        name: "Design Lab",
        category: "예술분과",
        is_recruiting: true,
    },
] as Club[];

test("normalizeClubKeyword는 공백과 대소문자를 정규화한다", () => {
    expect(normalizeClubKeyword("  DeSign  ")).toBe("design");
});

test("filterClubsByKeyword는 이름과 분과를 기준으로 검색한다", () => {
    expect(filterClubsByKeyword(clubs, "학술").map((club) => club.id)).toEqual([1]);
    expect(filterClubsByKeyword(clubs, "design").map((club) => club.id)).toEqual([3]);
});

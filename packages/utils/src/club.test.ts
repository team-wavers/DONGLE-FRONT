import { expect, test } from "vitest";
import { normalizeClubTags } from "./club";

test("normalizeClubTags는 null/undefined를 빈 배열로 바꾼다", () => {
    expect(normalizeClubTags(null)).toEqual([]);
    expect(normalizeClubTags(undefined)).toEqual([]);
});

test("normalizeClubTags는 배열을 복사해 반환한다", () => {
    const tags = ["개발", "디자인"];
    const normalized = normalizeClubTags(tags);

    expect(normalized).toEqual(tags);
    expect(normalized).not.toBe(tags);
});

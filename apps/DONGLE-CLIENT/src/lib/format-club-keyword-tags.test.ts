import { describe, expect, it } from "vitest";
import { formatClubKeywordTags } from "./format-club-keyword-tags";

describe("formatClubKeywordTags", () => {
    it("adds hash prefix to plain tags", () => {
        expect(formatClubKeywordTags(["스피치", "순천대 유일"])).toEqual(["#스피치", "#순천대 유일"]);
    });

    it("keeps one hash prefix when a tag already has one", () => {
        expect(formatClubKeywordTags(["#스피치"])).toEqual(["#스피치"]);
    });

    it("splits legacy hash-packed tags into separate keyword chips", () => {
        expect(formatClubKeywordTags(["#스피치 #순천대 유일 # 정기 스피치"])).toEqual([
            "#스피치",
            "#순천대 유일",
            "#정기 스피치",
        ]);
    });

    it("drops empty tag values", () => {
        expect(formatClubKeywordTags(["", "   ", "#"])).toEqual([]);
    });
});

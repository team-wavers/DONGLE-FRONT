import { describe, expect, test } from "vitest";
import {
    clubScheduleTagGroups,
    clubScheduleTags,
    clubTagGroups,
    clubTags,
    mainBannerTagGroups,
    mainBannerTags,
    reportTagGroups,
    reportTags,
    userTagGroups,
    userTags,
} from "./cache-tags";

describe("cache tags", () => {
    test("동아리 태그와 조합을 일관되게 만든다", () => {
        expect(clubTags.list).toBe("club");
        expect(clubTags.detail(7)).toBe("club-7");
        expect(clubTagGroups.list()).toEqual(["club"]);
        expect(clubTagGroups.detail(7)).toEqual(["club", "club-7"]);
    });

    test("사용자 태그와 조합을 일관되게 만든다", () => {
        expect(userTags.list).toBe("user");
        expect(userTags.detail(3)).toBe("user-3");
        expect(userTagGroups.list()).toEqual(["user"]);
        expect(userTagGroups.detail(3)).toEqual(["user", "user-3"]);
    });

    test("보고서 태그는 club scope와 item scope를 구분한다", () => {
        expect(reportTags.club(1)).toBe("report-club-1");
        expect(reportTags.item(9)).toBe("report-item-9");
        expect(reportTagGroups.club(1)).toEqual(["report", "report-club-1"]);
        expect(reportTagGroups.item(1, 9)).toEqual(["report", "report-club-1", "report-item-9"]);
    });

    test("메인 배너 태그와 조합을 일관되게 만든다", () => {
        expect(mainBannerTags.list).toBe("main-banner");
        expect(mainBannerTags.detail(2)).toBe("main-banner-2");
        expect(mainBannerTagGroups.list()).toEqual(["main-banner"]);
        expect(mainBannerTagGroups.detail(2)).toEqual(["main-banner", "main-banner-2"]);
    });

    test("일정 태그는 사용자 club scope와 관리자 item scope를 구분한다", () => {
        expect(clubScheduleTags.club(1)).toBe("club-schedule-club-1");
        expect(clubScheduleTags.item(4)).toBe("club-schedule-item-4");
        expect(clubScheduleTagGroups.club(1)).toEqual(["club-schedule", "club-schedule-club-1"]);
        expect(clubScheduleTagGroups.item(1, 4)).toEqual([
            "club-schedule",
            "club-schedule-club-1",
            "club-schedule-item-4",
        ]);
        expect(clubScheduleTagGroups.adminItem(4)).toEqual(["club-schedule", "club-schedule-item-4"]);
    });
});

import { describe, expect, test } from "vitest";
import { RECRUITMENT_STATUS } from "@/feature/club/constants/club.constants";
import type { ClubEditFormValues } from "./club-edit.schema";
import { buildClubEditPayload } from "./club-edit-payload";

function createValues(overrides: Partial<ClubEditFormValues> = {}): ClubEditFormValues {
    return {
        clubName: "동글",
        recruitmentStatus: RECRUITMENT_STATUS.CLOSED,
        category: "학술분과",
        location: "학생회관 301호",
        description: "<p>동아리 설명</p>",
        main_activities: "<p>주요 활동</p>",
        tags: "개발, 디자인",
        recruitmentStartDate: "",
        recruitmentEndDate: "",
        instagram: "",
        youtube: "dongle",
        iconUrls: [],
        iconFile: null,
        ...overrides,
    };
}

describe("buildClubEditPayload", () => {
    test("모집마감이면 모집 기간을 null로 제거한다", () => {
        expect(
            buildClubEditPayload(
                createValues({
                    recruitmentStartDate: "2026-05-20",
                    recruitmentEndDate: "2026-05-31",
                })
            )
        ).toMatchObject({
            is_recruiting: false,
            recruit_start: null,
            recruit_end: null,
        });
    });

    test("모집중이면 모집 기간을 유지한다", () => {
        expect(
            buildClubEditPayload(
                createValues({
                    recruitmentStatus: RECRUITMENT_STATUS.RECRUITING,
                    recruitmentStartDate: "2026-05-20",
                    recruitmentEndDate: "2026-05-31",
                })
            )
        ).toMatchObject({
            is_recruiting: true,
            recruit_start: "2026-05-20",
            recruit_end: "2026-05-31",
        });
    });

    test("아이콘 URL 결정값이 있으면 payload에 포함한다", () => {
        expect(buildClubEditPayload(createValues(), null).icon_url).toBeNull();
        expect(buildClubEditPayload(createValues(), "https://cdn.test/icon.png").icon_url).toBe("https://cdn.test/icon.png");
    });
});

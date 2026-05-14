import { describe, expect, test } from "vitest";
import { RECRUITMENT_STATUS } from "@/feature/club/constants/club.constants";
import { clubRegisterSchema, splitTags } from "./club-register.schema";

function createValues(overrides: Partial<Record<string, string>> = {}) {
    return {
        clubName: "동글",
        category: "학술분과",
        recruitmentStatus: RECRUITMENT_STATUS.CLOSED,
        location: "학생회관 301호",
        description: "<p>동아리 소개</p>",
        main_activities: "<p>주요 활동</p>",
        presidentName: "홍길동",
        presidentContact: "010-1234-5678",
        recruitmentStartDate: "",
        recruitmentEndDate: "",
        instagram: "",
        youtube: "",
        tags: "",
        ...overrides,
    };
}

describe("clubRegisterSchema", () => {
    test("모집중이면 모집 기간을 필수로 검증한다", () => {
        const result = clubRegisterSchema.safeParse(
            createValues({
                recruitmentStatus: RECRUITMENT_STATUS.RECRUITING,
            })
        );

        expect(result.success).toBe(false);
        expect(result.error?.issues.map((issue) => issue.path.join("."))).toContain("recruitmentStartDate");
        expect(result.error?.issues.map((issue) => issue.path.join("."))).toContain("recruitmentEndDate");
    });

    test("모집 종료일이 시작일보다 이르면 실패한다", () => {
        const result = clubRegisterSchema.safeParse(
            createValues({
                recruitmentStatus: RECRUITMENT_STATUS.RECRUITING,
                recruitmentStartDate: "2026-05-20",
                recruitmentEndDate: "2026-05-19",
            })
        );

        expect(result.success).toBe(false);
        expect(result.error?.issues[0]?.message).toBe("모집 마감일은 모집 시작일보다 늦어야 합니다");
    });

    test("마크업만 있는 rich text는 거부한다", () => {
        const result = clubRegisterSchema.safeParse(
            createValues({
                description: "<p><br></p>",
                main_activities: "<p>&nbsp;</p>",
            })
        );

        expect(result.success).toBe(false);
        expect(result.error?.issues.map((issue) => issue.path.join("."))).toEqual(
            expect.arrayContaining(["description", "main_activities"])
        );
    });
});

describe("splitTags", () => {
    test("쉼표 태그 문자열을 trim된 배열로 변환한다", () => {
        expect(splitTags(" 개발, 디자인 ,, 운영 ")).toEqual(["개발", "디자인", "운영"]);
    });
});

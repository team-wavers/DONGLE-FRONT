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
        loginId: "hong1234",
        password: "password1",
        passwordConfirm: "password1",
        recruitmentStartDate: "",
        recruitmentEndDate: "",
        instagram: "",
        youtube: "",
        tags: "",
        ...overrides,
    };
}

describe("clubRegisterSchema", () => {
    test.each([
        ["짧은 아이디", { loginId: "abc" }],
        ["대문자가 포함된 아이디", { loginId: "Hong1234" }],
        ["특수문자가 포함된 아이디", { loginId: "hong_1234" }],
        ["짧은 비밀번호", { password: "pass1" }],
        ["영문이 없는 비밀번호", { password: "12345678" }],
        ["숫자가 없는 비밀번호", { password: "password" }],
        ["긴 비밀번호", { password: "a1".repeat(37) }],
        ["비밀번호 확인 불일치", { passwordConfirm: "different1" }],
    ])("%s는 거부한다", (_label, overrides) => {
        const result = clubRegisterSchema.safeParse(createValues(overrides));

        expect(result.success).toBe(false);
    });

    test("유효한 아이디와 비밀번호 및 일치하는 확인값을 허용한다", () => {
        const result = clubRegisterSchema.safeParse(
            createValues({ loginId: "hong1234", password: "password1", passwordConfirm: "password1" })
        );

        expect(result.success).toBe(true);
    });

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

    test("모집 상태 라벨 값을 내부 enum 값으로 정규화한다", () => {
        const result = clubRegisterSchema.safeParse(
            createValues({
                recruitmentStatus: "모집중",
                recruitmentStartDate: "2026-05-20",
                recruitmentEndDate: "2026-05-21",
            })
        );

        expect(result.success).toBe(true);
        expect(result.data?.recruitmentStatus).toBe(RECRUITMENT_STATUS.RECRUITING);
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

    test("모집 시작일과 마감일이 같으면 실패한다", () => {
        const result = clubRegisterSchema.safeParse(
            createValues({
                recruitmentStatus: RECRUITMENT_STATUS.RECRUITING,
                recruitmentStartDate: "2026-05-20",
                recruitmentEndDate: "2026-05-20",
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

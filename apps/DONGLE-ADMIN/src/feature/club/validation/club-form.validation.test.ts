import { expect, test } from "vitest";
import { RECRUITMENT_STATUS } from "@/feature/club/constants/club.constants";
import {
    hasMeaningfulRichText,
    isValidPhoneNumber,
    normalizeRecruitmentStatus,
    validateClubForm,
    type ClubFormData,
} from "./club-form.validation";

function createFormData(overrides: Partial<ClubFormData> = {}): ClubFormData {
    return {
        clubName: "동글",
        category: "학술",
        recruitmentStatus: RECRUITMENT_STATUS.RECRUITING,
        tags: ["태그1"],
        main_activities: "스터디",
        description: "설명",
        location: "학생회관 101호",
        recruitmentStartDate: "2026-04-01",
        recruitmentEndDate: "2026-04-30",
        instagram: "",
        youtube: "",
        presidentName: "홍길동",
        presidentContact: "010-1234-5678",
        ...overrides,
    };
}

test("normalizeRecruitmentStatus는 화면 라벨을 내부 값으로 정규화한다", () => {
    expect(normalizeRecruitmentStatus("모집중")).toBe(RECRUITMENT_STATUS.RECRUITING);
    expect(normalizeRecruitmentStatus("모집마감")).toBe(RECRUITMENT_STATUS.CLOSED);
});

test("isValidPhoneNumber는 공백과 하이픈이 섞인 휴대폰 번호를 허용한다", () => {
    expect(isValidPhoneNumber("010 1234 5678")).toBe(true);
    expect(isValidPhoneNumber("010-1234-5678")).toBe(true);
    expect(isValidPhoneNumber("02-123-4567")).toBe(false);
});

test("hasMeaningfulRichText는 마크업만 있는 빈 에디터 값을 거부한다", () => {
    expect(hasMeaningfulRichText("<p></p>")).toBe(false);
    expect(hasMeaningfulRichText("<p><br></p>")).toBe(false);
    expect(hasMeaningfulRichText("<p>동아리 소개</p>")).toBe(true);
});

test("validateClubForm은 모집중일 때 모집 기간을 필수로 검증한다", () => {
    const result = validateClubForm(
        createFormData({
            recruitmentStartDate: "",
            recruitmentEndDate: "",
        })
    );

    expect(result.isValid).toBe(false);
    expect(result.fieldErrors.recruitmentStartDate).toBe("모집 시작일을 입력해주세요");
    expect(result.fieldErrors.recruitmentEndDate).toBe("모집 마감일을 입력해주세요");
});

test("validateClubForm은 회장 정보 검증을 선택적으로 끌 수 있다", () => {
    const result = validateClubForm(
        createFormData({
            presidentName: "",
            presidentContact: "",
        }),
        { requirePresident: false }
    );

    expect(result.isValid).toBe(true);
    expect(result.fieldErrors.presidentName).toBeUndefined();
    expect(result.fieldErrors.presidentContact).toBeUndefined();
});

test("validateClubForm은 모집 종료일이 시작일보다 이르면 실패한다", () => {
    const result = validateClubForm(
        createFormData({
            recruitmentStartDate: "2026-04-30",
            recruitmentEndDate: "2026-04-01",
        })
    );

    expect(result.isValid).toBe(false);
    expect(result.fieldErrors.recruitmentEndDate).toBe("모집 마감일은 모집 시작일보다 늦어야 합니다");
});

test("validateClubForm은 빈 rich text 소개와 주요 활동을 거부한다", () => {
    const result = validateClubForm(
        createFormData({
            description: "<p></p>",
            main_activities: "<p><br></p>",
        })
    );

    expect(result.isValid).toBe(false);
    expect(result.fieldErrors.description).toBe("동아리 설명을 입력해주세요");
    expect(result.fieldErrors.main_activities).toBe("주요 활동을 입력해주세요");
});

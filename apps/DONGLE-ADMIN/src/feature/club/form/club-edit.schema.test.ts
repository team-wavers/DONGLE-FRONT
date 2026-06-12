import { describe, expect, test } from "vitest";
import { RECRUITMENT_STATUS } from "@/feature/club/constants/club.constants";
import { clubEditSchema, createClubEditSavedValues, splitClubEditTags } from "./club-edit.schema";

function createValues(overrides: Record<string, unknown> = {}) {
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
        youtube: "",
        iconUrls: [],
        iconFile: null,
        ...overrides,
    };
}

describe("clubEditSchema", () => {
    test("모집중이면 모집 기간을 필수로 검증한다", () => {
        const result = clubEditSchema.safeParse(createValues({ recruitmentStatus: RECRUITMENT_STATUS.RECRUITING }));

        expect(result.success).toBe(false);
        expect(result.error?.issues.map((issue) => issue.path.join("."))).toEqual(
            expect.arrayContaining(["recruitmentStartDate", "recruitmentEndDate"])
        );
    });

    test("모집 마감일이 시작일보다 이르면 실패한다", () => {
        const result = clubEditSchema.safeParse(
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
        const result = clubEditSchema.safeParse(
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
        const result = clubEditSchema.safeParse(
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

describe("splitClubEditTags", () => {
    test("쉼표 태그 문자열을 trim된 배열로 변환한다", () => {
        expect(splitClubEditTags(" 개발, 디자인 ,, 운영 ")).toEqual(["개발", "디자인", "운영"]);
    });
});

describe("createClubEditSavedValues", () => {
    test("업로드된 아이콘 URL을 다음 수정 기준값에 반영하고 파일 값은 제거한다", () => {
        const iconFile = new File(["icon"], "icon.png", { type: "image/png" });

        expect(
            createClubEditSavedValues(createValues({ iconFile }), {
                iconUrl: "https://cdn.test/icon.png",
            })
        ).toMatchObject({
            iconUrls: ["https://cdn.test/icon.png"],
            iconFile: null,
        });
    });
});

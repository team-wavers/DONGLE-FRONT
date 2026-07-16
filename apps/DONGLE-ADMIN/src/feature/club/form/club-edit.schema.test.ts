import { describe, expect, test } from "vitest";
import type { Club } from "@dongle/types/club/club.d";
import { RECRUITMENT_STATUS } from "@/feature/club/constants/club.constants";
import {
    clubEditSchema,
    createClubEditDefaultValues,
    createClubEditSavedValues,
    splitClubEditTags,
} from "./club-edit.schema";

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
        applyUrl: "",
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

    test("지원 링크가 URL로 정규화되지 않으면 실패한다", () => {
        const result = clubEditSchema.safeParse(createValues({ applyUrl: "잘못된 링크" }));

        expect(result.success).toBe(false);
        expect(result.error?.issues[0]?.path.join(".")).toBe("applyUrl");
    });

    test("지원 링크가 비어 있으면 통과한다", () => {
        expect(clubEditSchema.safeParse(createValues({ applyUrl: "" })).success).toBe(true);
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

function createClub(overrides: Partial<Club> = {}): Club {
    return {
        id: 1,
        name: "동글",
        icon_url: null,
        is_recruiting: true,
        category: "학술분과",
        sns: {},
        tags: [],
        recruit_start: "2026-03-31",
        recruit_end: "2026-07-16",
        description: "<p>설명</p>",
        main_activities: "<p>활동</p>",
        apply_url: null,
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
        deleted_at: null,
        president: { id: 1, name: "회장", phone: "" },
        location: "학생회관 301호",
        ...overrides,
    };
}

describe("createClubEditDefaultValues", () => {
    test("서버가 내려준 ISO 타임스탬프를 날짜피커가 쓰는 YYYY-MM-DD로 정규화한다", () => {
        const values = createClubEditDefaultValues(
            createClub({
                recruit_start: "2026-03-31T00:00:00.000Z",
                recruit_end: "2026-07-16",
            })
        );

        expect(values.recruitmentStartDate).toBe("2026-03-31");
        expect(values.recruitmentEndDate).toBe("2026-07-16");
    });

    test("서버 로컬 타임존과 무관하게 KST 기준 날짜로 정규화한다", () => {
        const values = createClubEditDefaultValues(
            createClub({
                // UTC 기준으로는 07-16이지만 KST(+9)로는 07-17 00:30
                recruit_start: "2026-07-16T15:30:00.000Z",
                // UTC 기준으로는 07-17이지만 KST(+9)로는 07-18 00:00
                recruit_end: "2026-07-17T15:00:00.000Z",
            })
        );

        expect(values.recruitmentStartDate).toBe("2026-07-17");
        expect(values.recruitmentEndDate).toBe("2026-07-18");
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

import { expect, test } from "vitest";
import { buildClubDescription, buildClubPageMetadata } from "./club-page-metadata";

test("buildClubDescription은 소개가 없을 때 카테고리와 모집 상태를 포함한다", () => {
    const description = buildClubDescription({
        name: "메아리",
        category: "음악분과",
        description: "",
        main_activities: "",
        is_recruiting: true,
    });

    expect(description).toContain("순천대 음악분과 동아리 메아리");
    expect(description).toContain("현재 모집 중");
});

test("buildClubPageMetadata는 동아리명과 OG 이미지를 메타에 반영한다", () => {
    const metadata = buildClubPageMetadata({
        id: 3,
        name: "메아리",
        category: "음악분과",
        description: "어쿠스틱 밴드 동아리",
        main_activities: "",
        is_recruiting: true,
        icon_url: "https://example.com/icon.png",
    });

    expect(metadata.title).toBe("메아리");
    expect(metadata.description).toBe("어쿠스틱 밴드 동아리");
    expect(metadata.openGraph?.images).toEqual([
        {
            url: "https://example.com/icon.png",
            alt: "메아리 대표 이미지",
        },
    ]);
});

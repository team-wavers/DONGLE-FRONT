import { expect, test } from "vitest";
import { buildClubDescription, buildClubPageMetadata } from "./club-page-metadata";

const club = {
    id: 3,
    name: "메아리",
    category: "음악분과",
    description: "",
    main_activities: "",
    is_recruiting: true,
    icon_url: null,
};

test.each([
    ["<p>순천<strong>대</strong> 밴드</p>", "순천대 밴드"],
    ["<p>정기 공연</p><p>합주<br>연습</p>", "정기 공연 합주 연습"],
    ['<p title="연습 > 공연">밴드 소개</p>', "밴드 소개"],
    ["<p>공연&nbsp;&amp;&nbsp;합주 &#x1F3B8; &#44032;</p>", "공연 & 합주 🎸 가"],
    ["<p>&lt;밴드&gt; &amp;lt;소개&amp;gt;</p>", "<밴드> &lt;소개&gt;"],
    ["<!-- 숨긴 설명 --><script>오래된 정보</script><style>숨긴 스타일</style><p>현재 소개</p>", "현재 소개"],
    ["<template>숨긴 템플릿</template><noscript>대체 내용</noscript><p>현재 소개</p>", "현재 소개"],
    ["  일반 텍스트\n 소개  ", "일반 텍스트 소개"],
])("buildClubDescription은 rich text를 읽을 수 있는 설명으로 정리한다: %s", (description, expected) => {
    expect(buildClubDescription({ ...club, description })).toBe(expected);
});

test("소개가 마크업과 공백뿐이면 주요 활동을 사용한다", () => {
    expect(buildClubDescription({
        ...club,
        description: "<p>&nbsp;<br></p>",
        main_activities: "<p>정기 <strong>공연</strong></p>",
    })).toBe("정기 공연");
});

test("소개와 주요 활동에 텍스트가 없으면 모집 상태를 포함한 대체 설명을 사용한다", () => {
    expect(buildClubDescription({
        ...club,
        description: "<p>&nbsp;</p>",
        main_activities: "<img src='/club.png'><script>숨긴 내용</script>",
        is_recruiting: false,
    })).toBe("순천대 음악분과 동아리 메아리의 소개, 활동보고서, 일정 정보입니다. 모집 마감.");
});

test("설명 길이 제한은 HTML을 정리한 텍스트에 적용한다", () => {
    const description = `<p>${"가".repeat(141)}</p>`;
    expect(buildClubDescription({ ...club, description })).toBe(`${"가".repeat(137)}...`);
});

test("정리한 동아리 설명은 description, OG, Twitter에 동일하게 적용한다", () => {
    const metadata = buildClubPageMetadata({ ...club, description: "<p>밴드&nbsp;&amp; 합주</p>" });
    expect(metadata.description).toBe("밴드 & 합주");
    expect(metadata.openGraph?.description).toBe(metadata.description);
    expect(metadata.twitter?.description).toBe(metadata.description);
});

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

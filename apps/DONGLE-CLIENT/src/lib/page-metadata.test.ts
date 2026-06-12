import { expect, test } from "vitest";
import { buildPageMetadata } from "./page-metadata";

test("buildPageMetadata는 title, canonical, OG, Twitter 메타를 생성한다", () => {
    const metadata = buildPageMetadata({
        title: "전체 일정",
        description: "공개 일정을 확인합니다.",
        canonicalPath: "/schedules",
    });

    expect(metadata.title).toBe("전체 일정");
    expect(metadata.description).toBe("공개 일정을 확인합니다.");
    expect(metadata.alternates).toEqual({ canonical: "/schedules" });
    expect(metadata.openGraph).toMatchObject({
        title: "전체 일정 | 동글",
        description: "공개 일정을 확인합니다.",
        url: "/schedules",
        siteName: "동글",
        type: "website",
    });
    expect(metadata.twitter).toMatchObject({
        card: "summary_large_image",
        title: "전체 일정 | 동글",
        description: "공개 일정을 확인합니다.",
    });
});

test("buildPageMetadata는 openGraphTitle override를 지원한다", () => {
    const metadata = buildPageMetadata({
        title: "봄 정기공연",
        description: "활동보고서입니다.",
        canonicalPath: "/clubs/3/reports/1",
        openGraphTitle: "봄 정기공연 | 메아리",
        openGraphType: "article",
        image: "https://example.com/report.jpg",
        imageAlt: "봄 정기공연 대표 사진",
    });

    expect(metadata.openGraph?.title).toBe("봄 정기공연 | 메아리");
    expect(metadata.openGraph).toMatchObject({ type: "article" });
    expect(metadata.openGraph?.images).toEqual([
        {
            url: "https://example.com/report.jpg",
            alt: "봄 정기공연 대표 사진",
        },
    ]);
});

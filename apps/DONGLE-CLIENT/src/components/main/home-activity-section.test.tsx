import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import HomeActivitySection from "./home-activity-section";

describe("HomeActivitySection", () => {
    it("실제 동아리명과 원문 제목, Seoul 등록일, 보고서 상세 링크를 표시한다", () => {
        const html = renderToStaticMarkup(
            <HomeActivitySection
                reports={[
                    {
                        reportId: 178,
                        clubId: 2,
                        clubName: "스파이크",
                        title: "10월 활동보고서",
                        createdAt: "2026-11-09T15:30:00Z",
                        thumbnailUrl: null,
                    },
                ]}
            />
        );

        expect(html).toContain("요즘 동아리는");
        expect(html).toContain("스파이크");
        expect(html).toContain("10월 활동보고서");
        expect(html).toContain('href="/clubs/2/reports/178"');
        expect(html).toContain('dateTime="2026-11-09T15:30:00Z"');
        expect(html).toMatch(/2026\.11\.10|11\.10|11월\s*10일/);
        expect(html).not.toContain('target="_blank"');
    });

    it("이미지가 없는 보고서도 제목과 상세 진입점을 유지한다", () => {
        const html = renderToStaticMarkup(
            <HomeActivitySection
                reports={[
                    {
                        reportId: 1,
                        clubId: 3,
                        clubName: "사진 없는 동아리",
                        title: "함께한 정기 모임",
                        createdAt: "2026-11-01T00:00:00Z",
                        thumbnailUrl: null,
                    },
                ]}
            />
        );

        expect(html).toContain("함께한 정기 모임");
        expect(html).toContain('href="/clubs/3/reports/1"');
        expect(html).not.toContain('src="null"');
        expect(html).not.toContain('src=""');
    });

    it("썸네일 이미지와 해당 활동을 설명하는 대체 텍스트를 표시한다", () => {
        const thumbnailUrl = "https://s3.ap-northeast-2.amazonaws.com/dongle.bucket/club-reports/photo.jpg";
        const html = renderToStaticMarkup(
            <HomeActivitySection
                reports={[
                    {
                        reportId: 178,
                        clubId: 2,
                        clubName: "스파이크",
                        title: "10월 활동보고서",
                        createdAt: "2026-11-10T00:00:00Z",
                        thumbnailUrl,
                    },
                ]}
            />
        );

        expect(html).toContain('alt="스파이크 10월 활동보고서 이미지"');
        expect(html).toContain(encodeURIComponent(thumbnailUrl));
        expect(html).not.toContain("이미지 없음");
    });

    it("활동이 없으면 제목과 빈 섹션을 표시하지 않는다", () => {
        expect(renderToStaticMarkup(<HomeActivitySection reports={[]} />)).toBe("");
    });
});

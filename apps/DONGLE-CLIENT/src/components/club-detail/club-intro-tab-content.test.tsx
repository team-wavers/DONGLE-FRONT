import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ClubIntroTabContent from "./club-intro-tab-content";

describe("ClubIntroTabContent", () => {
    it("rich text 본문이 준비되는 동안 소개와 주요 활동 제목만 렌더링한다", () => {
        const html = renderToStaticMarkup(
            <ClubIntroTabContent
                club={{
                    description: "<p>동아리 소개입니다.</p>",
                    main_activities: "<p>주요 활동입니다.</p>",
                }}
            />
        );

        expect(html).toContain("동아리 소개");
        expect(html).toContain("주요 활동");
        expect(html).not.toContain('data-slot="skeleton"');
        expect(html).not.toContain("동아리 소개입니다.");
        expect(html).not.toContain("주요 활동입니다.");
    });

    it("본문이 없으면 스켈레톤 대신 empty-state 문구를 렌더링한다", () => {
        const html = renderToStaticMarkup(
            <ClubIntroTabContent
                club={{
                    description: "",
                    main_activities: "",
                }}
            />
        );

        expect(html).toContain("등록된 동아리 소개가 없습니다.");
        expect(html).toContain("등록된 주요 활동 정보가 없습니다.");
        expect(html).not.toContain('data-slot="skeleton"');
    });
});

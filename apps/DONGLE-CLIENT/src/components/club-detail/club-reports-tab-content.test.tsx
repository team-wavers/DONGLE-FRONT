import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ClubReportsTabContent from "./club-reports-tab-content";

describe("ClubReportsTabContent", () => {
    it("활동보고서 조회 실패 상태는 활동보고서 없음 문구 대신 실패 안내를 렌더링한다", () => {
        const html = renderToStaticMarkup(
            <ClubReportsTabContent clubId="1" clubName="동글동아리" reports={[]} loadFailed />
        );

        expect(html).toContain("활동보고서를 불러오지 못했습니다. 잠시 후 다시 확인해주세요.");
        expect(html).not.toContain("등록된 활동보고서가 없습니다.");
    });
});

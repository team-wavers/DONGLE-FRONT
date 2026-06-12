import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ClubListSection from "./club-list-section";

describe("ClubListSection", () => {
    it("동아리 조회 실패 상태는 빈 목록 문구 대신 실패 안내를 렌더링한다", () => {
        const html = renderToStaticMarkup(
            <ClubListSection
                clubs={[]}
                summaryText="동아리 목록을 불러오지 못했습니다."
                emptyStateMessage="등록된 동아리가 없습니다."
                loadFailed
            />
        );

        expect(html).toContain("동아리 목록을 불러오지 못했습니다. 잠시 후 다시 확인해주세요.");
        expect(html).not.toContain("등록된 동아리가 없습니다.");
    });
});

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ClubDetailPageSkeleton, ClubReportDetailPageSkeleton } from "./page-skeletons";

describe("page skeletons", () => {
    it("동아리 상세 스켈레톤은 border 없이 큰 블록 위주로 렌더링한다", () => {
        const html = renderToStaticMarkup(<ClubDetailPageSkeleton showBackLink />);

        expect(html).toContain("pt-12");
        expect(html).toContain("rounded-xl");
        expect(html).not.toContain("border");
        expect(html.match(/data-slot="skeleton"/g)?.length ?? 0).toBeLessThanOrEqual(10);
    });

    it("활동보고서 상세 스켈레톤은 제목, 이미지, 본문, 다른 보고서 영역을 렌더링한다", () => {
        const html = renderToStaticMarkup(<ClubReportDetailPageSkeleton />);

        expect(html).toContain("lg:grid-cols-[minmax(0,1fr)_280px]");
        expect(html).toContain("aspect-[4/3]");
        expect(html).toContain("border-t border-zinc-200 pt-8");
        expect(html).toContain("lg:sticky lg:top-20");
        expect(html.match(/data-slot="skeleton"/g)?.length ?? 0).toBeGreaterThanOrEqual(16);
    });
});

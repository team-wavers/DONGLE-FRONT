import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";
import type { ClubReport } from "@dongle/types/club/club.report.d";
import FilterableReportList, {
    filterReportsByKeyword,
    normalizeReportKeyword,
} from "./filterable-report-list";

const reports = [
    {
        id: 1,
        title: "정기 모임 후기",
        content: "<p>이번 정기 모임에서는 <strong>신입 부원</strong> 환영회를 진행했습니다.</p>",
        image_urls: [],
        createdAt: "2026-04-22T00:00:00.000Z",
        updatedAt: "2026-04-22T00:00:00.000Z",
        deletedAt: null,
        club_id: 10,
    },
    {
        id: 2,
        title: "분기 보고",
        content: "<p>예산 집행 내역을 정리했습니다.</p>",
        image_urls: [],
        createdAt: "2026-05-01T00:00:00.000Z",
        updatedAt: "2026-05-01T00:00:00.000Z",
        deletedAt: null,
        club_id: 10,
    },
] as ClubReport[];

test("normalizeReportKeyword는 공백과 대소문자를 정규화한다", () => {
    expect(normalizeReportKeyword("  Report  ")).toBe("report");
});

test("filterReportsByKeyword는 제목을 기준으로 검색한다", () => {
    expect(filterReportsByKeyword(reports, "정기").map((report) => report.id)).toEqual([1]);
    expect(filterReportsByKeyword(reports, "분기").map((report) => report.id)).toEqual([2]);
});

test("filterReportsByKeyword는 content를 raw 문자열 기준으로 검색하며 HTML 태그를 벗기지 않는다", () => {
    expect(filterReportsByKeyword(reports, "신입 부원").map((report) => report.id)).toEqual([1]);
    expect(filterReportsByKeyword(reports, "<strong>").map((report) => report.id)).toEqual([1]);
    expect(filterReportsByKeyword(reports, "예산").map((report) => report.id)).toEqual([2]);
});

test("FilterableReportList는 조회 실패 상태를 빈 목록과 구분한다", () => {
    const html = renderToStaticMarkup(
        React.createElement(FilterableReportList, { reports: [], clubId: "10", loadFailed: true })
    );

    expect(html).toContain("활동보고서를 불러오지 못했습니다. 잠시 후 다시 확인해주세요.");
    expect(html).not.toContain("활동보고서가 없습니다.");
});

test("FilterableReportList는 조회 실패에도 작성하기 진입점을 유지한다", () => {
    const html = renderToStaticMarkup(
        React.createElement(FilterableReportList, { reports: [], clubId: "10", loadFailed: true })
    );

    expect(html).toContain("작성하기");
    expect(html).toContain("./create");
});

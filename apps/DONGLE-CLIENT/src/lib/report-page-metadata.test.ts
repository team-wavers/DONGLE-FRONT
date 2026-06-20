import type { ClubReport } from "@dongle/types/club/club.report";
import { expect, test } from "vitest";
import { buildReportDescription, buildReportPageMetadata } from "./report-page-metadata";

const report: ClubReport = {
    id: 12,
    club_id: 3,
    title: "봄 정기공연",
    content: "<p>무대 준비와 공연 후기를 정리했습니다.</p>",
    createdAt: "2026-03-01T00:00:00.000Z",
    updatedAt: "2026-03-01T00:00:00.000Z",
    deletedAt: null,
    image_urls: ["https://example.com/report.jpg"],
};

test("buildReportDescription은 본문이 없을 때 동아리명을 포함한 fallback을 반환한다", () => {
    expect(buildReportDescription({ ...report, content: "" }, "메아리")).toContain("메아리의 활동보고서입니다.");
});

test("buildReportPageMetadata는 보고서 제목과 대표 이미지를 OG 메타에 반영한다", () => {
    const metadata = buildReportPageMetadata(report, "메아리", 3);

    expect(metadata.title).toBe("봄 정기공연");
    expect(metadata.openGraph?.title).toBe("봄 정기공연 | 메아리");
    expect(metadata.openGraph).toMatchObject({ type: "article" });
    expect(metadata.twitter?.images).toEqual(["https://example.com/report.jpg"]);
});

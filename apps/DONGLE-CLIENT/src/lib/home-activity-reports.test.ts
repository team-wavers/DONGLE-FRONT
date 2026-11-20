import type { ClubReport } from "@dongle/types/club/club.report";
import { describe, expect, it } from "vitest";
import { selectHomeActivityReports } from "./home-activity-reports";

function report(id: number, createdAt: string, overrides: Partial<ClubReport> = {}): ClubReport {
    return {
        id,
        title: `활동보고서 ${id}`,
        content: "<p>최근 활동 소식</p>",
        image_urls: [],
        createdAt,
        updatedAt: createdAt,
        deletedAt: null,
        club_id: 999,
        ...overrides,
    };
}

describe("selectHomeActivityReports", () => {
    it("각 동아리의 최신 보고서 한 건을 전체 최신순으로 최대 네 건 선택한다", () => {
        const result = selectHomeActivityReports([
            {
                clubId: 1,
                clubName: "스파이크",
                reports: [report(11, "2026-11-01T00:00:00Z"), report(12, "2026-11-10T00:00:00Z")],
            },
            { clubId: 2, clubName: "하늘", reports: [report(21, "2026-11-08T00:00:00Z")] },
            { clubId: 3, clubName: "4-H회", reports: [report(31, "2026-11-17T00:00:00Z")] },
            { clubId: 4, clubName: "애드리브", reports: [report(41, "2026-11-06T00:00:00Z")] },
            { clubId: 5, clubName: "코마", reports: [report(51, "2026-11-05T00:00:00Z")] },
        ]);

        expect(result.map(({ reportId, clubId }) => [reportId, clubId])).toEqual([
            [31, 3],
            [12, 1],
            [21, 2],
            [41, 4],
        ]);
    });

    it("등록 시각이 같으면 보고서 ID 내림차순으로 안정적으로 선택하며 원본을 변경하지 않는다", () => {
        const sources = [
            {
                clubId: 1,
                clubName: "스파이크",
                reports: [report(10, "2026-11-10T00:00:00Z"), report(12, "2026-11-10T00:00:00Z")],
            },
            { clubId: 2, clubName: "하늘", reports: [report(11, "2026-11-10T00:00:00Z")] },
        ];
        const original = structuredClone(sources);

        expect(selectHomeActivityReports(sources).map(({ reportId }) => reportId)).toEqual([12, 11]);
        expect(selectHomeActivityReports([...sources].reverse()).map(({ reportId }) => reportId)).toEqual([12, 11]);
        expect(sources).toEqual(original);
    });

    it("삭제된 최신 글은 제외하고 해당 동아리의 남은 최신 글을 선택한다", () => {
        const result = selectHomeActivityReports([
            {
                clubId: 1,
                clubName: "스파이크",
                reports: [
                    report(11, "2026-11-01T00:00:00Z"),
                    report(12, "2026-11-10T00:00:00Z", { deletedAt: "2026-11-11T00:00:00Z" }),
                ],
            },
            { clubId: 2, clubName: "하늘", reports: [] },
        ]);

        expect(result.map(({ reportId }) => reportId)).toEqual([11]);
        expect(selectHomeActivityReports([])).toEqual([]);
        expect(selectHomeActivityReports([{ clubId: 1, clubName: "빈 동아리", reports: [] }])).toEqual([]);
    });

    it("비교 불가능한 등록일은 선택하지 않고 유효한 보고서로 채운다", () => {
        const result = selectHomeActivityReports([
            {
                clubId: 1,
                clubName: "스파이크",
                reports: [report(10, "not-a-date"), report(11, "2026-11-10T00:00:00Z")],
            },
        ]);

        expect(result.map(({ reportId }) => reportId)).toEqual([11]);
    });

    it("응답의 club_id 대신 조회한 부모 동아리 ID와 이름을 사용하고 본문을 카드에 전달하지 않는다", () => {
        const result = selectHomeActivityReports([
            {
                clubId: 2,
                clubName: "스파이크",
                reports: [report(178, "2026-11-10T00:00:00Z", { club_id: undefined as unknown as number })],
            },
        ]);

        expect(result[0]).toEqual({
            reportId: 178,
            clubId: 2,
            clubName: "스파이크",
            title: "활동보고서 178",
            createdAt: "2026-11-10T00:00:00Z",
            thumbnailUrl: null,
        });
    });

    it("첨부 이미지를 우선하고 본문 이미지로 보완하며 둘 다 없으면 null을 유지한다", () => {
        const result = selectHomeActivityReports([
            {
                clubId: 1,
                clubName: "첨부 이미지 동아리",
                reports: [
                    report(1, "2026-11-03T00:00:00Z", {
                        image_urls: ["https://example.com/attachment.jpg"],
                        content: '<img src="https://example.com/body.jpg">',
                    }),
                ],
            },
            {
                clubId: 2,
                clubName: "본문 이미지 동아리",
                reports: [
                    report(2, "2026-11-02T00:00:00Z", {
                        content: '<p>활동</p><img src="https://example.com/body.jpg">',
                    }),
                ],
            },
            { clubId: 3, clubName: "사진 없는 동아리", reports: [report(3, "2026-11-01T00:00:00Z")] },
        ]);

        expect(result.map(({ thumbnailUrl }) => thumbnailUrl)).toEqual([
            "https://example.com/attachment.jpg",
            "https://example.com/body.jpg",
            null,
        ]);
    });
});

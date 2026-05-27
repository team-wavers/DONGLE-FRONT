import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ClubSchedulesTabContent from "./club-schedules-tab-content";

describe("ClubSchedulesTabContent", () => {
    it("외부 링크가 있는 공개 일정은 자세히 보기 링크를 렌더링한다", () => {
        const html = renderToStaticMarkup(
            <ClubSchedulesTabContent
                clubName="동글동아리"
                schedules={{
                    upcoming: [
                        {
                            id: 1,
                            clubId: 12,
                            title: "공개 설명회",
                            type: "event",
                            start_at: "2026-05-20T10:00:00.000Z",
                            end_at: "2026-05-20T12:00:00.000Z",
                            is_public: true,
                            location: "학생회관",
                            description: "신청 링크를 확인하세요.",
                            external_url: "https://dongle.kr/schedule",
                        },
                    ],
                    past: [],
                }}
            />
        );

        expect(html).toContain('href="https://dongle.kr/schedule"');
        expect(html).toContain('target="_blank"');
        expect(html).toContain('rel="noreferrer"');
        expect(html).toContain("자세히 보기");
    });

    it("외부 링크가 없는 공개 일정은 자세히 보기 링크를 렌더링하지 않는다", () => {
        const html = renderToStaticMarkup(
            <ClubSchedulesTabContent
                clubName="동글동아리"
                schedules={{
                    upcoming: [
                        {
                            id: 1,
                            clubId: 12,
                            title: "정기 모임",
                            type: "regular_meeting",
                            start_at: "2026-05-20T10:00:00.000Z",
                            end_at: "2026-05-20T12:00:00.000Z",
                            is_public: true,
                            location: "학생회관",
                            description: "정기 모임입니다.",
                            external_url: null,
                        },
                    ],
                    past: [],
                }}
            />
        );

        expect(html).not.toContain("자세히 보기");
    });

    it("일정 조회 실패 상태는 일정 없음 문구 대신 실패 안내를 렌더링한다", () => {
        const html = renderToStaticMarkup(
            <ClubSchedulesTabContent
                clubName="동글동아리"
                loadFailed
                schedules={{
                    upcoming: [],
                    past: [],
                }}
            />
        );

        expect(html).toContain("일정을 불러오지 못했습니다. 잠시 후 다시 확인해주세요.");
        expect(html).not.toContain("등록된 공개 일정이 없습니다.");
    });
});

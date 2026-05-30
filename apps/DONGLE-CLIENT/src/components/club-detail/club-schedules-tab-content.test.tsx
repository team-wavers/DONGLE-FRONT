import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ClubSchedulesTabContent from "./club-schedules-tab-content";

describe("ClubSchedulesTabContent", () => {
    it("외부 링크가 있는 공개 일정은 자세히 보기 링크를 렌더링한다", () => {
        const html = renderToStaticMarkup(
            <ClubSchedulesTabContent
                schedules={{
                    ongoing: [],
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
                schedules={{
                    ongoing: [],
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
                loadFailed
                schedules={{
                    ongoing: [],
                    upcoming: [],
                    past: [],
                }}
            />
        );

        expect(html).toContain("일정을 불러오지 못했습니다. 잠시 후 다시 확인해주세요.");
        expect(html).not.toContain("등록된 공개 일정이 없습니다.");
    });

    it("진행 중인 공개 일정은 별도 섹션으로 렌더링하고 나머지는 Seoul 기준 시작 월별로 묶는다", () => {
        const html = renderToStaticMarkup(
            <ClubSchedulesTabContent
                schedules={{
                    ongoing: [
                        {
                            id: 1,
                            clubId: 12,
                            title: "진행 중인 공개 일정",
                            type: "event",
                            start_at: "2026-05-20T10:00:00.000Z",
                            end_at: "2026-05-20T12:00:00.000Z",
                            is_public: true,
                            location: "학생회관",
                            description: "지금 진행 중입니다.",
                            external_url: null,
                        },
                    ],
                    upcoming: [
                        {
                            id: 2,
                            clubId: 12,
                            title: "다가오는 공개 일정",
                            type: "regular_meeting",
                            start_at: "2026-06-20T10:00:00.000Z",
                            end_at: "2026-06-20T12:00:00.000Z",
                            is_public: true,
                            location: "동아리방",
                            description: "",
                            external_url: null,
                        },
                    ],
                    past: [],
                }}
            />
        );

        expect(html).toContain('aria-label="진행 중인 일정"');
        expect(html).toContain('aria-label="월별 일정"');
        expect(html).toContain("진행 중인 일정");
        expect(html).toContain("2026년 6월");
        expect(html.indexOf('aria-label="진행 중인 일정"')).toBeLessThan(html.indexOf('aria-label="월별 일정"'));
        expect(html).toContain("진행 중인 공개 일정");
        expect(html).toContain("다가오는 공개 일정");
        expect(html).not.toContain("다가오는 일정");
    });

    it("현재 기준 가까운 순서에서 같은 월이 떨어져 있어도 월 섹션은 하나로 합친다", () => {
        const html = renderToStaticMarkup(
            <ClubSchedulesTabContent
                schedules={{
                    ongoing: [],
                    upcoming: [
                        {
                            id: 1,
                            clubId: 12,
                            title: "6월 첫 일정",
                            type: "event",
                            start_at: "2026-06-01T10:00:00.000Z",
                            end_at: "2026-06-01T12:00:00.000Z",
                            is_public: true,
                            location: "",
                            description: "",
                            external_url: null,
                        },
                        {
                            id: 3,
                            clubId: 12,
                            title: "6월 둘째 일정",
                            type: "regular_meeting",
                            start_at: "2026-06-02T10:00:00.000Z",
                            end_at: "2026-06-02T12:00:00.000Z",
                            is_public: true,
                            location: "",
                            description: "",
                            external_url: null,
                        },
                    ],
                    past: [
                        {
                            id: 2,
                            clubId: 12,
                            title: "5월 지난 일정",
                            type: "recruitment",
                            start_at: "2026-05-30T10:00:00.000Z",
                            end_at: "2026-05-30T12:00:00.000Z",
                            is_public: true,
                            location: "",
                            description: "",
                            external_url: null,
                        },
                    ],
                    remaining: [
                        {
                            id: 1,
                            clubId: 12,
                            title: "6월 첫 일정",
                            type: "event",
                            start_at: "2026-06-01T10:00:00.000Z",
                            end_at: "2026-06-01T12:00:00.000Z",
                            is_public: true,
                            location: "",
                            description: "",
                            external_url: null,
                        },
                        {
                            id: 2,
                            clubId: 12,
                            title: "5월 지난 일정",
                            type: "recruitment",
                            start_at: "2026-05-30T10:00:00.000Z",
                            end_at: "2026-05-30T12:00:00.000Z",
                            is_public: true,
                            location: "",
                            description: "",
                            external_url: null,
                        },
                        {
                            id: 3,
                            clubId: 12,
                            title: "6월 둘째 일정",
                            type: "regular_meeting",
                            start_at: "2026-06-02T10:00:00.000Z",
                            end_at: "2026-06-02T12:00:00.000Z",
                            is_public: true,
                            location: "",
                            description: "",
                            external_url: null,
                        },
                    ],
                }}
            />
        );

        expect(html.match(/2026년 6월/g)?.length).toBe(1);
        expect(html).toContain("6월 첫 일정");
        expect(html).toContain("6월 둘째 일정");
    });

    it("일정 목록은 날짜 아젠다 없이 각 아이템의 일시와 장소를 렌더링한다", () => {
        const html = renderToStaticMarkup(
            <ClubSchedulesTabContent
                schedules={{
                    ongoing: [],
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
                            external_url: null,
                        },
                    ],
                    past: [],
                }}
            />
        );

        expect(html).toContain("5월 20일 19시 00분 - 21시 00분");
        expect(html).toContain("학생회관");
        expect(html).not.toContain("sm:grid-cols-[4rem_minmax(0,1fr)]");
    });

    it("같은 날짜의 일정도 각 아이템 안에 일시를 독립적으로 렌더링한다", () => {
        const html = renderToStaticMarkup(
            <ClubSchedulesTabContent
                schedules={{
                    ongoing: [],
                    upcoming: [
                        {
                            id: 1,
                            clubId: 12,
                            title: "오전 설명회",
                            type: "event",
                            start_at: "2026-05-20T01:00:00.000Z",
                            end_at: "2026-05-20T02:00:00.000Z",
                            is_public: true,
                            location: "학생회관",
                            description: "",
                            external_url: null,
                        },
                        {
                            id: 2,
                            clubId: 12,
                            title: "오후 공연",
                            type: "event",
                            start_at: "2026-05-20T06:00:00.000Z",
                            end_at: "2026-05-20T08:00:00.000Z",
                            is_public: true,
                            location: "강당",
                            description: "",
                            external_url: null,
                        },
                    ],
                    past: [],
                }}
            />
        );

        expect(html).toContain("오전 설명회");
        expect(html).toContain("오후 공연");
        expect(html.match(/5월 20일/g)?.length ?? 0).toBeGreaterThanOrEqual(2);
    });

    it("일정 유형 태그는 유형별로 다른 색상 클래스를 렌더링한다", () => {
        const html = renderToStaticMarkup(
            <ClubSchedulesTabContent
                schedules={{
                    ongoing: [],
                    upcoming: [
                        {
                            id: 1,
                            clubId: 12,
                            title: "모집 설명회",
                            type: "recruitment",
                            start_at: "2026-05-20T10:00:00.000Z",
                            end_at: "2026-05-20T12:00:00.000Z",
                            is_public: true,
                            location: "학생회관",
                            description: "",
                            external_url: null,
                        },
                        {
                            id: 2,
                            clubId: 12,
                            title: "공개 행사",
                            type: "event",
                            start_at: "2026-05-21T10:00:00.000Z",
                            end_at: "2026-05-21T12:00:00.000Z",
                            is_public: true,
                            location: "강당",
                            description: "",
                            external_url: null,
                        },
                        {
                            id: 3,
                            clubId: 12,
                            title: "정기 모임",
                            type: "regular_meeting",
                            start_at: "2026-05-22T10:00:00.000Z",
                            end_at: "2026-05-22T12:00:00.000Z",
                            is_public: true,
                            location: "동아리방",
                            description: "",
                            external_url: null,
                        },
                    ],
                    past: [],
                }}
            />
        );

        expect(html).toContain("border-sky-200 bg-sky-50 text-sky-700");
        expect(html).toContain("border-violet-200 bg-violet-50 text-violet-700");
        expect(html).toContain("border-emerald-200 bg-emerald-50 text-emerald-700");
        expect(html).toContain("text-[11px]");
    });
});

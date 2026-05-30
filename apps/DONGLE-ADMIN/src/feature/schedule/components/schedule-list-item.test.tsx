import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { ClubSchedule } from "../schedule.types";
import { ScheduleListItem } from "./schedule-list-item";

const schedule: ClubSchedule = {
    id: 1,
    clubId: 12,
    clubName: "스파이크",
    category: "체육분과",
    title: "신입 부원 오리엔테이션",
    type: "recruitment",
    startsAt: "2026-05-20T10:00:00.000Z",
    endsAt: "2026-05-20T12:00:00.000Z",
    isPublic: true,
    location: "학생회관 302호",
    description: "신입 부원 대상 활동 소개와 팀 배정 안내를 진행합니다.",
};

describe("ScheduleListItem", () => {
    it("기본 variant는 날짜 배지를 한 번만 렌더링한다", () => {
        const html = renderToStaticMarkup(<ScheduleListItem schedule={schedule} />);

        expect(html.match(/<time/g)?.length).toBe(1);
        expect(html).toContain("신입 부원 오리엔테이션");
    });

    it("관리자 화면 variant는 날짜 아젠다 대신 동아리명을 우선 표시한다", () => {
        const html = renderToStaticMarkup(<ScheduleListItem schedule={schedule} variant="admin" />);

        expect(html).toContain("스파이크");
        expect(html).toContain("체육분과");
        expect(html).toContain("신입 부원 오리엔테이션");
        expect(html.indexOf("스파이크")).toBeLessThan(html.indexOf("신입 부원 오리엔테이션"));
        expect(html).not.toContain(">5월<");
    });

    it("일정 표시 영역은 작은 태그와 사용자 일정 포맷, 장소 아이콘 행을 렌더링한다", () => {
        const html = renderToStaticMarkup(<ScheduleListItem schedule={schedule} variant="admin" />);

        expect(html).toContain("text-[11px]");
        expect(html).toContain("공개");
        expect(html).toContain("5월 20일 19시 00분 - 21시 00분");
        expect(html).not.toContain("2026.05.20");
        expect(html).toContain("학생회관 302호");
    });
});

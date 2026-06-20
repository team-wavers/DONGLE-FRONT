import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import HeaderScheduleLink from "./header-schedule-link";

const navigationMock = vi.hoisted(() => ({
    pathname: "/",
}));

vi.mock("next/navigation", () => ({
    usePathname: () => navigationMock.pathname,
}));

describe("HeaderScheduleLink", () => {
    it("전체 일정 전역 진입점을 렌더링한다", () => {
        navigationMock.pathname = "/";

        const html = renderToStaticMarkup(<HeaderScheduleLink />);

        expect(html).toContain('href="/schedules"');
        expect(html).toContain('aria-label="전체 일정"');
        expect(html).toContain("전체 일정");
        expect(html).not.toContain('aria-current="page"');
    });

    it("전체 일정 경로에서는 현재 페이지 상태를 표시한다", () => {
        navigationMock.pathname = "/schedules";

        const html = renderToStaticMarkup(<HeaderScheduleLink />);

        expect(html).toContain('aria-current="page"');
    });
});

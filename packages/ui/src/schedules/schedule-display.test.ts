import React from "react";
import { describe, expect, it } from "vitest";
import { ScheduleDisplayItemContent } from "./schedule-display-list";
import {
    formatScheduleDisplayDateRange,
    formatScheduleDisplayDateTimeRange,
    getScheduleDisplayDateParts,
    groupScheduleDisplayItemsByMonth,
    sortScheduleDisplayMonthGroupsByDistance,
    type ScheduleDisplayItem,
} from "./schedule-display";

const baseItem = {
    type: "event",
    typeLabel: "행사",
    dateBadge: {
        month: "6월",
        day: "01",
        weekday: "월",
        dateTime: "2026-06-01T10:00:00.000Z",
    },
    dateTimeLabel: "6월 1일 19시 00분 - 21시 00분",
} satisfies Omit<ScheduleDisplayItem, "id" | "title" | "dateKey" | "monthKey" | "monthLabel">;

function createItem(
    overrides: Pick<ScheduleDisplayItem, "id" | "title" | "dateKey" | "monthKey" | "monthLabel">
): ScheduleDisplayItem {
    return {
        ...baseItem,
        ...overrides,
    };
}

function findElementByType(node: React.ReactNode, type: string): React.ReactElement | null {
    if (!React.isValidElement(node)) {
        return null;
    }

    if (node.type === type) {
        return node;
    }

    const children = (node.props as { children?: React.ReactNode }).children;

    if (Array.isArray(children)) {
        for (const child of children) {
            const found = findElementByType(child, type);

            if (found) {
                return found;
            }
        }

        return null;
    }

    return findElementByType(children, type);
}

describe("schedule display helpers", () => {
    it("Seoul 기준 날짜 배지와 월 그룹 key를 만든다", () => {
        expect(getScheduleDisplayDateParts("2026-05-20T15:00:00.000Z")).toEqual({
            year: "2026",
            month: "5월",
            day: "21",
            weekday: "목",
            dateKey: "2026-05-21",
            monthKey: "2026-05",
            monthLabel: "2026년 5월",
        });
    });

    it("timezone 없는 서버 datetime 문자열은 Seoul 로컬 시간으로 표시한다", () => {
        expect(getScheduleDisplayDateParts("2026-05-20 19:00:00")).toMatchObject({
            month: "5월",
            day: "20",
            weekday: "수",
            dateKey: "2026-05-20",
            monthKey: "2026-05",
        });
        expect(formatScheduleDisplayDateTimeRange("2026-05-20 19:00:00", "2026-05-20 21:00:00")).toBe(
            "5월 20일 19시 00분 - 21시 00분"
        );
    });

    it("일정 기간은 00시 00분 시간을 생략하고 Seoul 기준으로 표시한다", () => {
        expect(formatScheduleDisplayDateTimeRange("2026-05-20T10:00:00.000Z", "2026-05-20T12:00:00.000Z")).toBe(
            "5월 20일 19시 00분 - 21시 00분"
        );
        expect(formatScheduleDisplayDateTimeRange("2026-05-19T15:00:00.000Z", "2026-05-20T12:00:00.000Z")).toBe(
            "5월 20일 - 21시 00분"
        );
        expect(formatScheduleDisplayDateRange("2026-05-19T01:23:00.000Z", "2026-05-22T01:23:00.000Z")).toBe(
            "5월 19일 - 5월 22일"
        );
    });

    it("일정 item은 기존 순서를 유지하면서 같은 월을 하나의 그룹으로 합친다", () => {
        const items = [
            createItem({
                id: 1,
                title: "6월 첫 일정",
                dateKey: "2026-06-01",
                monthKey: "2026-06",
                monthLabel: "2026년 6월",
            }),
            createItem({
                id: 2,
                title: "5월 지난 일정",
                dateKey: "2026-05-30",
                monthKey: "2026-05",
                monthLabel: "2026년 5월",
            }),
            createItem({
                id: 3,
                title: "6월 둘째 일정",
                dateKey: "2026-06-02",
                monthKey: "2026-06",
                monthLabel: "2026년 6월",
            }),
        ];

        const groups = groupScheduleDisplayItemsByMonth(items);

        expect(groups.map((group) => group.label)).toEqual(["2026년 6월", "2026년 5월"]);
        expect(groups[0].items.map((item) => item.title)).toEqual(["6월 첫 일정", "6월 둘째 일정"]);
    });

    it("월 섹션은 Seoul 기준 현재 월과 가까운 순서로 정렬한다", () => {
        const groups = groupScheduleDisplayItemsByMonth([
            createItem({
                id: 1,
                title: "9월 일정",
                dateKey: "2026-09-01",
                monthKey: "2026-09",
                monthLabel: "2026년 9월",
            }),
            createItem({
                id: 2,
                title: "5월 일정",
                dateKey: "2026-05-01",
                monthKey: "2026-05",
                monthLabel: "2026년 5월",
            }),
            createItem({
                id: 3,
                title: "7월 일정",
                dateKey: "2026-07-01",
                monthKey: "2026-07",
                monthLabel: "2026년 7월",
            }),
            createItem({
                id: 4,
                title: "6월 일정",
                dateKey: "2026-06-01",
                monthKey: "2026-06",
                monthLabel: "2026년 6월",
            }),
        ]);

        const sortedGroups = sortScheduleDisplayMonthGroupsByDistance(groups, new Date("2026-06-15T00:00:00.000Z"));

        expect(sortedGroups.map((group) => group.label)).toEqual([
            "2026년 6월",
            "2026년 7월",
            "2026년 5월",
            "2026년 9월",
        ]);
    });

    it("외부 링크 클릭 콜백을 item과 함께 호출한다", () => {
        const item = {
            ...createItem({
                id: 1,
                title: "외부 링크 일정",
                dateKey: "2026-06-01",
                monthKey: "2026-06",
                monthLabel: "2026년 6월",
            }),
            externalUrl: "https://dongle.kr/schedule",
        };
        let clickedItem: ScheduleDisplayItem | null = null;
        const element = ScheduleDisplayItemContent({
            item,
            onExternalLinkClick: (nextItem) => {
                clickedItem = nextItem;
            },
        });
        const link = findElementByType(element, "a");

        expect(link).not.toBeNull();
        (link?.props as { onClick?: () => void }).onClick?.();
        expect(clickedItem).toBe(item);
    });
});

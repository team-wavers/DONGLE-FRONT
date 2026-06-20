import { describe, expect, it } from "vitest";
import { getScheduleDialogVisibleSchedule } from "../form/use-club-schedule-form";

describe("ScheduleFormDialog state", () => {
    it("닫힘 애니메이션 중 부모가 schedule을 비워도 마지막 수정 대상을 유지한다", () => {
        const editingSchedule = { id: 10, title: "수정 중인 일정" };

        expect(getScheduleDialogVisibleSchedule(false, null, editingSchedule)).toEqual(editingSchedule);
    });

    it("다시 열릴 때는 현재 schedule 값을 기준으로 등록/수정 상태를 판단한다", () => {
        const previousSchedule = { id: 10, title: "이전 수정 일정" };
        const nextSchedule = { id: 11, title: "다음 수정 일정" };

        expect(getScheduleDialogVisibleSchedule(true, null, previousSchedule)).toBeNull();
        expect(getScheduleDialogVisibleSchedule(true, nextSchedule, previousSchedule)).toEqual(nextSchedule);
    });
});

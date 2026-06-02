import { describe, expect, it, vi } from "vitest";
import {
    createAdminCommonClubScheduleAction,
    createClubScheduleAction,
    updateAdminClubScheduleAction,
    updateClubScheduleAction,
} from "../action/schedule.action";
import type { ClubScheduleFormValues } from "./schedule-form.schema";
import { submitClubScheduleValues } from "./use-club-schedule-submit";

vi.mock("../action/schedule.action", () => ({
    createAdminCommonClubScheduleAction: vi.fn().mockResolvedValue({ ok: true }),
    createClubScheduleAction: vi.fn().mockResolvedValue({ ok: true }),
    updateAdminClubScheduleAction: vi.fn().mockResolvedValue({ ok: true }),
    updateClubScheduleAction: vi.fn().mockResolvedValue({ ok: true }),
}));

const values: ClubScheduleFormValues = {
    title: "공통 행사",
    type: "event",
    startsAt: "2026-06-10T10:00",
    endsAt: "2026-06-10T12:00",
    isPublic: true,
    location: "",
    description: "",
    externalUrl: "",
};

describe("submitClubScheduleValues", () => {
    it("관리자 공통 일정 생성은 관리자 공통 생성 action으로 제출한다", async () => {
        await submitClubScheduleValues({ clubId: null, values });

        expect(createAdminCommonClubScheduleAction).toHaveBeenCalledWith(values);
    });

    it("관리자 공통 일정 수정은 관리자 일정 수정 action으로 제출한다", async () => {
        await submitClubScheduleValues({ clubId: null, scheduleId: 7, values });

        expect(updateAdminClubScheduleAction).toHaveBeenCalledWith(7, values);
    });

    it("회장 일정 생성은 동아리 일정 생성 action으로 제출한다", async () => {
        await submitClubScheduleValues({ clubId: 3, values });

        expect(createClubScheduleAction).toHaveBeenCalledWith(3, values);
    });

    it("회장 일정 수정은 동아리 일정 수정 action으로 제출한다", async () => {
        await submitClubScheduleValues({ clubId: 3, scheduleId: 7, values });

        expect(updateClubScheduleAction).toHaveBeenCalledWith(3, 7, values);
    });
});

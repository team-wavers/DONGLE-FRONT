import { afterEach, describe, expect, test, vi } from "vitest";
import { createClubService, updateClubService, uploadClubIconService } from "@dongle/service/club/club.service";
import { createUserService } from "@dongle/service/user/user.service";
import { revalidateTag } from "next/cache";
import { RECRUITMENT_STATUS } from "@/feature/club/constants/club.constants";
import { submitClubRegisterAction } from "./club-register.action";
import type { ClubRegisterFormValues } from "./club-register.schema";

vi.mock("@dongle/service/club/club.service", () => ({
    createClubService: vi.fn(),
    updateClubService: vi.fn(),
    uploadClubIconService: vi.fn(),
}));

vi.mock("@dongle/service/user/user.service", () => ({
    createUserService: vi.fn(),
}));

vi.mock("next/cache", () => ({
    revalidateTag: vi.fn(),
}));

vi.mock("@/shared/action/server-action-auth", () => ({
    requireServerActionAccessToken: vi.fn().mockResolvedValue("access-token"),
}));

vi.mock("@/lib/sentry/capture-server-exception", () => ({
    captureServerException: vi.fn(),
}));

function createValues(overrides: Partial<ClubRegisterFormValues> = {}): ClubRegisterFormValues {
    return {
        clubName: "동글",
        category: "학술분과",
        recruitmentStatus: RECRUITMENT_STATUS.CLOSED,
        location: "학생회관 301호",
        description: "<p>동아리 소개</p>",
        main_activities: "<p>주요 활동</p>",
        presidentName: "홍길동",
        presidentContact: "010-1234-5678",
        recruitmentStartDate: "",
        recruitmentEndDate: "",
        instagram: "",
        youtube: "",
        tags: "",
        iconUrls: [],
        iconFile: null,
        ...overrides,
    };
}

describe("submitClubRegisterAction", () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    test("동아리 생성 후 선택된 아이콘을 업로드하고 icon_url을 저장한다", async () => {
        const iconFile = new File(["icon"], "icon.png", { type: "image/png" });

        vi.mocked(createUserService).mockResolvedValue({
            isSuccess: true,
            result: { id: 7 },
        } as Awaited<ReturnType<typeof createUserService>>);
        vi.mocked(createClubService).mockResolvedValue({
            isSuccess: true,
            result: { id: 11 },
        } as Awaited<ReturnType<typeof createClubService>>);
        vi.mocked(uploadClubIconService).mockResolvedValue({
            isSuccess: true,
            result: { icon_url: "https://cdn.test/icon.png" },
        } as Awaited<ReturnType<typeof uploadClubIconService>>);
        vi.mocked(updateClubService).mockResolvedValue({
            isSuccess: true,
            result: { id: 11 },
        } as Awaited<ReturnType<typeof updateClubService>>);

        const result = await submitClubRegisterAction("registration-key", createValues({ iconFile }));

        expect(result.ok).toBe(true);
        expect(uploadClubIconService).toHaveBeenCalledWith(11, iconFile);
        expect(updateClubService).toHaveBeenCalledWith(11, {
            icon_url: "https://cdn.test/icon.png",
        });
        expect(revalidateTag).toHaveBeenCalledWith("user");
        expect(revalidateTag).toHaveBeenCalledWith("user-7");
        expect(revalidateTag).toHaveBeenCalledWith("club");
        expect(revalidateTag).toHaveBeenCalledWith("club-11");
    });
});

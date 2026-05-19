import { afterEach, describe, expect, test, vi } from "vitest";
import { updateClubService, uploadClubIconService } from "@dongle/service/club/club.service";
import { revalidateTag } from "next/cache";
import { RECRUITMENT_STATUS } from "@/feature/club/constants/club.constants";
import { submitClubEditAction } from "./club-edit.action";
import type { ClubEditFormValues } from "./club-edit.schema";

vi.mock("@dongle/service/club/club.service", () => ({
    updateClubService: vi.fn(),
    uploadClubIconService: vi.fn(),
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

function createValues(overrides: Partial<ClubEditFormValues> = {}): ClubEditFormValues {
    return {
        clubName: "동글",
        recruitmentStatus: RECRUITMENT_STATUS.CLOSED,
        category: "학술분과",
        location: "학생회관 301호",
        description: "<p>동아리 소개</p>",
        main_activities: "<p>주요 활동</p>",
        tags: "개발, 디자인",
        recruitmentStartDate: "",
        recruitmentEndDate: "",
        instagram: "",
        youtube: "",
        iconUrls: [],
        iconFile: null,
        ...overrides,
    };
}

describe("submitClubEditAction", () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    test("새 아이콘 업로드 성공 시 업로드된 URL을 성공 데이터로 반환한다", async () => {
        const iconFile = new File(["icon"], "icon.png", { type: "image/png" });

        vi.mocked(uploadClubIconService).mockResolvedValue({
            isSuccess: true,
            result: { icon_url: "https://cdn.test/icon.png" },
        } as Awaited<ReturnType<typeof uploadClubIconService>>);
        vi.mocked(updateClubService).mockResolvedValue({
            isSuccess: true,
            result: { id: 11 },
        } as Awaited<ReturnType<typeof updateClubService>>);

        const result = await submitClubEditAction({
            clubId: "11",
            values: createValues({ iconFile }),
        });

        if (!result.ok) {
            throw new Error(result.formError ?? "동아리 수정 액션이 실패했습니다.");
        }

        expect(result.data).toEqual({ iconUrl: "https://cdn.test/icon.png" });
        expect(updateClubService).toHaveBeenCalledWith(
            11,
            expect.objectContaining({
                icon_url: "https://cdn.test/icon.png",
            })
        );
        expect(revalidateTag).toHaveBeenCalledWith("club");
        expect(revalidateTag).toHaveBeenCalledWith("club-11");
    });
});

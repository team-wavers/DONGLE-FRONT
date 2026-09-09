import { afterEach, describe, expect, test, vi } from "vitest";
import { createClubService, updateClubService, uploadClubIconService } from "@dongle/service/club/club.service";
import { revalidateTag } from "next/cache";
import { RECRUITMENT_STATUS } from "@/feature/club/constants/club.constants";
import { submitClubRegisterAction } from "./club-register.action";
import type { ClubRegisterFormValues } from "./club-register.schema";

vi.mock("@dongle/service/club/club.service", () => ({
    createClubService: vi.fn(),
    updateClubService: vi.fn(),
    uploadClubIconService: vi.fn(),
}));

vi.mock("next/cache", () => ({
    revalidateTag: vi.fn(),
}));

vi.mock("next/headers", () => ({
    cookies: vi.fn(async () => ({
        set: vi.fn(),
        get: vi.fn(),
        delete: vi.fn(),
    })),
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

    test("액세스 토큰 없이도 회장 계정을 포함한 동아리 생성을 한 번의 요청으로 호출하고 sessionExpired를 반환하지 않는다", async () => {
        vi.mocked(createClubService).mockResolvedValue({
            isSuccess: true,
            result: { id: 11 },
        } as Awaited<ReturnType<typeof createClubService>>);

        const result = await submitClubRegisterAction("registration-key", createValues());

        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.redirectTo).toBe("/club-register/register-success");
            expect(result.redirectTo).not.toContain("data=");
            expect(result.redirectTo).not.toContain("tempPassword");
        }
        expect(createClubService).toHaveBeenCalledTimes(1);
        expect(createClubService).toHaveBeenCalledWith(
            expect.objectContaining({
                key: "registration-key",
                newPresident: expect.objectContaining({
                    name: "홍길동",
                    phone: "010-1234-5678",
                }),
            })
        );
        expect(result).not.toMatchObject({ sessionExpired: true });
    });

    test("동아리 생성 후 선택된 아이콘을 업로드하고 icon_url을 저장한다", async () => {
        const iconFile = new File(["icon"], "icon.png", { type: "image/png" });

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
        expect(revalidateTag).toHaveBeenCalledWith("club");
        expect(revalidateTag).toHaveBeenCalledWith("club-11");
    });

    test("동아리 생성이 실패하면(키 무효 등) 회장 계정도 만들어지지 않고 실패 응답만 반환한다", async () => {
        vi.mocked(createClubService).mockResolvedValue({
            isSuccess: false,
            error: { message: "club create failed" },
        } as Awaited<ReturnType<typeof createClubService>>);

        const result = await submitClubRegisterAction("registration-key", createValues());

        expect(result).toEqual({
            ok: false,
            formError: "club create failed",
        });
        // User+Club 생성이 백엔드에서 하나의 트랜잭션으로 처리되므로,
        // 실패 시 회장 계정을 별도로 정리(삭제)할 필요 자체가 없다.
        expect(createClubService).toHaveBeenCalledTimes(1);
        expect(revalidateTag).not.toHaveBeenCalled();
    });
});

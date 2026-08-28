import { afterEach, describe, expect, test, vi } from "vitest";
import { patchUserService } from "@dongle/service/user/user.service";
import { revalidateTag } from "next/cache";
import { submitClubPresidentAction } from "./club-president.action";

vi.mock("@dongle/service/user/user.service", () => ({
    patchUserService: vi.fn(),
}));

vi.mock("next/cache", () => ({
    revalidateTag: vi.fn(),
}));

vi.mock("@/shared/action/server-action-auth", () => ({
    requireServerActionAccessToken: vi.fn().mockResolvedValue({
        accessToken: "access-token",
        claims: { role: "president", club_id: 11 },
    }),
}));

vi.mock("@/lib/sentry/capture-server-exception", () => ({
    captureServerException: vi.fn(),
}));

describe("submitClubPresidentAction", () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    test("patchUserService 실패 시 user/club 태그를 초기화하지 않는다", async () => {
        vi.mocked(patchUserService).mockResolvedValue({
            isSuccess: false,
            error: {
                message: "patch failed",
                detail: "회장 정보를 수정할 수 없습니다.",
            },
        });

        const result = await submitClubPresidentAction({
            clubId: "11",
            presidentId: 7,
            values: {
                presidentName: "홍길동",
                presidentContact: "010-1234-5678",
            },
        });

        expect(result).toEqual({
            ok: false,
            formError: "patch failed",
        });
        expect(revalidateTag).not.toHaveBeenCalled();
    });

    test("서비스 401이면 sessionExpired를 반환하고 태그를 초기화하지 않는다", async () => {
        vi.mocked(patchUserService).mockResolvedValue({
            isSuccess: false,
            error: {
                status: 401,
                message: "Unauthorized",
                detail: "Unauthorized",
            },
        });

        const result = await submitClubPresidentAction({
            clubId: "11",
            presidentId: 7,
            values: {
                presidentName: "홍길동",
                presidentContact: "010-1234-5678",
            },
        });

        expect(result).toMatchObject({
            ok: false,
            sessionExpired: true,
        });
        expect(revalidateTag).not.toHaveBeenCalled();
    });

    test("성공 시 user와 club tag group을 초기화한다", async () => {
        vi.mocked(patchUserService).mockResolvedValue({
            isSuccess: true,
            result: {
                id: 7,
                name: "홍길동",
                login_id: "dongle",
                password: "",
                role: "president",
                phone: "010-1234-5678",
                refresh_token: "",
                created_at: "2026-01-01T00:00:00.000Z",
                updated_at: "2026-01-01T00:00:00.000Z",
                deleted_at: null,
            },
        });

        const result = await submitClubPresidentAction({
            clubId: "11",
            presidentId: 7,
            values: {
                presidentName: "홍길동",
                presidentContact: "010-1234-5678",
            },
        });

        expect(result.ok).toBe(true);
        expect(patchUserService).toHaveBeenCalledWith(7, {
            name: "홍길동",
            phone: "010-1234-5678",
        });
        expect(revalidateTag).toHaveBeenCalledWith("user");
        expect(revalidateTag).toHaveBeenCalledWith("user-7");
        expect(revalidateTag).toHaveBeenCalledWith("club");
        expect(revalidateTag).toHaveBeenCalledWith("club-11");
    });
});

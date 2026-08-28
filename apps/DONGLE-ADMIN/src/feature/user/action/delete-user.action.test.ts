import { afterEach, describe, expect, test, vi } from "vitest";
import { deleteUserService } from "@dongle/service/user/user.service";
import { revalidateTag } from "next/cache";
import { requireServerActionAccessToken } from "@/shared/action/server-action-auth";
import { deleteUserAction } from "./delete-user.action";

vi.mock("@dongle/service/user/user.service", () => ({
    deleteUserService: vi.fn(),
}));

vi.mock("@/shared/action/server-action-auth", () => ({
    requireServerActionAccessToken: vi.fn(),
}));

vi.mock("@/lib/sentry/capture-server-exception", () => ({
    captureServerException: vi.fn(),
}));

vi.mock("next/cache", () => ({
    revalidateTag: vi.fn(),
}));

describe("deleteUserAction", () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    test("본인 계정 삭제 요청은 서비스 호출 없이 실패한다", async () => {
        vi.mocked(requireServerActionAccessToken).mockResolvedValue({
            accessToken: "access-token",
            claims: { user_id: 7, role: "admin" },
        });

        const result = await deleteUserAction(7);

        expect(result).toEqual({
            ok: false,
            formError: "본인 계정은 삭제할 수 없습니다.",
        });
        expect(deleteUserService).not.toHaveBeenCalled();
        expect(revalidateTag).not.toHaveBeenCalled();
    });

    test("토큰에서 사용자 식별 정보를 가져오지 못하면 실패하고 삭제를 진행하지 않는다", async () => {
        vi.mocked(requireServerActionAccessToken).mockResolvedValue({
            accessToken: "access-token",
            claims: { role: "admin" },
        });

        const result = await deleteUserAction(7);

        expect(result).toEqual({
            ok: false,
            formError: "사용자 정보를 가져올 수 없습니다.",
        });
        expect(deleteUserService).not.toHaveBeenCalled();
        expect(revalidateTag).not.toHaveBeenCalled();
    });

    test("서비스 401이면 sessionExpired를 반환하고 태그를 초기화하지 않는다", async () => {
        vi.mocked(requireServerActionAccessToken).mockResolvedValue({
            accessToken: "access-token",
            claims: { user_id: 1, role: "admin" },
        });
        vi.mocked(deleteUserService).mockResolvedValue({
            isSuccess: false,
            error: { status: 401, message: "Unauthorized", detail: "Unauthorized" },
        });

        const result = await deleteUserAction(7);

        expect(result).toMatchObject({ ok: false, sessionExpired: true });
        expect(revalidateTag).not.toHaveBeenCalled();
    });

    test("다른 사용자 삭제 성공 시 사용자 태그를 초기화한다", async () => {
        vi.mocked(requireServerActionAccessToken).mockResolvedValue({
            accessToken: "access-token",
            claims: { user_id: 1, role: "admin" },
        });
        vi.mocked(deleteUserService).mockResolvedValue({
            isSuccess: true,
            result: null,
        });

        const result = await deleteUserAction(7);

        expect(result).toEqual({ ok: true, data: null, message: "사용자가 성공적으로 삭제되었습니다." });
        expect(deleteUserService).toHaveBeenCalledWith(7);
        expect(revalidateTag).toHaveBeenCalledWith("user");
        expect(revalidateTag).toHaveBeenCalledWith("user-7");
    });
});

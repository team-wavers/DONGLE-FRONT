import { afterEach, describe, expect, test, vi } from "vitest";
import { getAccessTokenFromServerCookie } from "@dongle/api/utils/cookie/server-cookie.util";
import { getUserIdFromToken } from "@dongle/api/utils/jwt.util";
import { loginService } from "@dongle/service/auth/auth.service";
import { getUserService, patchUserService } from "@dongle/service/user/user.service";
import { revalidateTag } from "next/cache";
import { changeAccountFormAction } from "./change-account-form.action";

vi.mock("@dongle/api/utils/cookie/server-cookie.util", () => ({
    getAccessTokenFromServerCookie: vi.fn(),
}));

vi.mock("@dongle/api/utils/jwt.util", () => ({
    getUserIdFromToken: vi.fn(),
}));

vi.mock("@dongle/service/auth/auth.service", () => ({
    loginService: vi.fn(),
}));

vi.mock("@dongle/service/user/user.service", () => ({
    getUserService: vi.fn(),
    patchUserService: vi.fn(),
}));

vi.mock("@/lib/sentry/capture-server-exception", () => ({
    captureServerException: vi.fn(),
}));

vi.mock("next/cache", () => ({
    revalidateTag: vi.fn(),
}));

function createFormData(overrides: Record<string, string> = {}) {
    const formData = new FormData();
    const values = {
        currentPassword: "current-password",
        newId: "new-admin",
        newPassword: "",
        confirmPassword: "",
        ...overrides,
    };

    Object.entries(values).forEach(([key, value]) => {
        formData.set(key, value);
    });

    return formData;
}

const currentUser = {
    id: 7,
    name: "운영자",
    login_id: "admin",
    password: "",
    role: "admin" as const,
    phone: "010-1234-5678",
    refresh_token: "",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    deleted_at: null,
};

describe("changeAccountFormAction", () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    test("계정 patch 실패 시 실패 응답을 반환하고 사용자 태그를 초기화하지 않는다", async () => {
        vi.mocked(getAccessTokenFromServerCookie).mockResolvedValue("access-token");
        vi.mocked(getUserIdFromToken).mockReturnValue(7);
        vi.mocked(getUserService).mockResolvedValue({
            isSuccess: true,
            result: currentUser,
        });
        vi.mocked(loginService).mockResolvedValue({
            isSuccess: true,
            result: {
                accessToken: "access-token",
                refreshToken: "refresh-token",
            },
        });
        vi.mocked(patchUserService).mockResolvedValue({
            isSuccess: false,
            error: {
                message: "patch failed",
                detail: "이미 사용 중인 아이디입니다.",
            },
        });

        const result = await changeAccountFormAction({}, createFormData());

        expect(result).toEqual({
            success: false,
            error: "patch failed",
        });
        expect(revalidateTag).not.toHaveBeenCalled();
    });

    test("계정 patch 성공 시 사용자 태그를 초기화한다", async () => {
        vi.mocked(getAccessTokenFromServerCookie).mockResolvedValue("access-token");
        vi.mocked(getUserIdFromToken).mockReturnValue(7);
        vi.mocked(getUserService).mockResolvedValue({
            isSuccess: true,
            result: currentUser,
        });
        vi.mocked(loginService).mockResolvedValue({
            isSuccess: true,
            result: {
                accessToken: "access-token",
                refreshToken: "refresh-token",
            },
        });
        vi.mocked(patchUserService).mockResolvedValue({
            isSuccess: true,
            result: {
                ...currentUser,
                login_id: "new-admin",
            },
        });

        const result = await changeAccountFormAction({}, createFormData());

        expect(result).toEqual({ success: true });
        expect(patchUserService).toHaveBeenCalledWith(7, { login_id: "new-admin" });
        expect(revalidateTag).toHaveBeenCalledWith("user");
        expect(revalidateTag).toHaveBeenCalledWith("user-7");
    });
});

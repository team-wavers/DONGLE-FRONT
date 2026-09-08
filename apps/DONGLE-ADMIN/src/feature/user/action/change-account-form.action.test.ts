import { afterEach, describe, expect, test, vi } from "vitest";
import { loginService } from "@dongle/service/auth/auth.service";
import { getUserService, patchUserService } from "@dongle/service/user/user.service";
import { revalidateTag } from "next/cache";
import { requireServerActionAccessToken } from "@/shared/action/server-action-auth";
import { ACCESS_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME } from "@dongle/api/utils/cookie/cookie.contant";
import { changeAccountFormAction } from "./change-account-form.action";

const cookieSet = vi.fn();

vi.mock("next/headers", () => ({
    cookies: vi.fn(async () => ({
        set: cookieSet,
    })),
}));

vi.mock("@dongle/api/utils/jwt.util", () => ({
    decodeJwtToken: vi.fn(() => ({ exp: Math.floor(Date.now() / 1000) + 900 })),
    getTokenExpiresIn: vi.fn(() => 900),
}));

vi.mock("@/shared/action/server-action-auth", () => ({
    requireServerActionAccessToken: vi.fn(),
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

    test("getUserService 실패 시 캐시를 초기화하지 않는다", async () => {
        vi.mocked(requireServerActionAccessToken).mockResolvedValue({
            accessToken: "access-token",
            claims: { user_id: 7, role: "admin" },
        });
        vi.mocked(getUserService).mockResolvedValue({
            isSuccess: false,
            error: { message: "user missing", detail: "user missing" },
        });

        const result = await changeAccountFormAction({}, createFormData());

        expect(result).toEqual({
            success: false,
            error: "사용자 정보를 가져올 수 없습니다.",
        });
        expect(loginService).not.toHaveBeenCalled();
        expect(revalidateTag).not.toHaveBeenCalled();
    });

    test("비밀번호 확인 login 성공 시 쿠키를 갱신한다", async () => {
        vi.mocked(requireServerActionAccessToken).mockResolvedValue({
            accessToken: "access-token",
            claims: { user_id: 7, role: "admin" },
        });
        vi.mocked(getUserService).mockResolvedValue({
            isSuccess: true,
            result: currentUser,
        });
        vi.mocked(loginService).mockResolvedValue({
            isSuccess: true,
            result: {
                accessToken: "new-access-token",
                refreshToken: "new-refresh-token",
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
        expect(cookieSet).toHaveBeenCalledWith(
            ACCESS_TOKEN_COOKIE_NAME,
            "new-access-token",
            expect.objectContaining({ httpOnly: true })
        );
        expect(cookieSet).toHaveBeenCalledWith(
            REFRESH_TOKEN_COOKIE_NAME,
            "new-refresh-token",
            expect.objectContaining({ httpOnly: true })
        );
    });

    test("계정 patch 실패 시 실패 응답을 반환하고 사용자 태그를 초기화하지 않는다", async () => {
        vi.mocked(requireServerActionAccessToken).mockResolvedValue({
            accessToken: "access-token",
            claims: { user_id: 7, role: "admin" },
        });
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
        vi.mocked(requireServerActionAccessToken).mockResolvedValue({
            accessToken: "access-token",
            claims: { user_id: 7, role: "admin" },
        });
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

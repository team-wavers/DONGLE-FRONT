import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { loginService } from "@dongle/service/auth/auth.service";
import { cookies } from "next/headers";
import { decodeJwtToken } from "@dongle/api/utils/jwt.util";
import { loginFormAction } from "./login-form.action";

const cookieStore = vi.hoisted(() => ({ set: vi.fn() }));

vi.mock("@dongle/service/auth/auth.service", () => ({
    loginService: vi.fn(),
}));

vi.mock("@dongle/api/utils/jwt.util", () => ({
    decodeJwtToken: vi.fn(),
    getTokenExpiresIn: vi.fn().mockReturnValue(900),
}));

vi.mock("@dongle/api/utils/cookie/cookie.options", () => ({
    getCookieOptions: vi.fn(({ maxAge, httpOnly }) => ({ maxAge, httpOnly, sameSite: "lax", path: "/" })),
}));

vi.mock("next/headers", () => ({
    cookies: vi.fn(),
}));

vi.mock("@/lib/sentry/capture-server-exception", () => ({
    captureServerException: vi.fn(),
}));

function createFormData() {
    const formData = new FormData();
    formData.set("username", " admin ");
    formData.set("password", "password");
    return formData;
}

describe("loginFormAction", () => {
    beforeEach(() => {
        vi.mocked(cookies).mockResolvedValue(cookieStore as never);
        vi.mocked(loginService).mockResolvedValue({
            isSuccess: true,
            result: { accessToken: "access-token", refreshToken: "refresh-token" },
        });
        vi.mocked(decodeJwtToken)
            .mockReturnValueOnce({ exp: 2_000_000_000, role: "admin", club_id: 7 })
            .mockReturnValueOnce({ exp: 2_000_100_000 });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    test("로그인 성공 시 JWT를 해석하고 access/refresh 쿠키를 설정한다", async () => {
        const result = await loginFormAction({}, createFormData());

        expect(loginService).toHaveBeenCalledWith({ login_id: "admin", password: "password" });
        expect(cookieStore.set).toHaveBeenCalledTimes(2);
        expect(cookieStore.set).toHaveBeenNthCalledWith(
            1,
            "accessToken",
            "access-token",
            expect.objectContaining({ httpOnly: true })
        );
        expect(cookieStore.set).toHaveBeenNthCalledWith(
            2,
            "refreshToken",
            "refresh-token",
            expect.objectContaining({ httpOnly: true })
        );
        expect(result).toEqual({ success: true, clubId: "7", role: "admin" });
    });

    test("서비스 실패는 실패 상태를 반환하고 쿠키를 설정하지 않는다", async () => {
        vi.mocked(loginService).mockResolvedValue({
            isSuccess: false,
            error: { message: "Unauthorized", detail: "아이디 또는 비밀번호가 올바르지 않습니다." },
        });

        const result = await loginFormAction({}, createFormData());

        expect(result).toMatchObject({ success: false });
        expect(cookieStore.set).not.toHaveBeenCalled();
    });

    test("JWT decode 실패는 실패 상태를 반환하고 쿠키를 설정하지 않는다", async () => {
        vi.mocked(decodeJwtToken).mockReset().mockReturnValue(null);

        const result = await loginFormAction({}, createFormData());

        expect(result).toEqual({ success: false, error: "로그인에 실패했습니다." });
        expect(cookieStore.set).not.toHaveBeenCalled();
    });
});

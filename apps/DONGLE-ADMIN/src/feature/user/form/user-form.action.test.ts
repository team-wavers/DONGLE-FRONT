import { afterEach, expect, test, vi } from "vitest";
import { createUserService } from "@dongle/service/user/user.service";
import { revalidateTag } from "next/cache";
import { requireServerActionAccessToken } from "@/shared/action/server-action-auth";
import { submitUserCreateAction } from "@/feature/user/form/user-form.action";

vi.mock("@dongle/service/user/user.service", () => ({
    createUserService: vi.fn(),
}));

vi.mock("@/shared/action/server-action-auth", () => ({
    requireServerActionAccessToken: vi.fn().mockResolvedValue("access-token"),
}));

vi.mock("@/lib/sentry/capture-server-exception", () => ({
    captureServerException: vi.fn(),
}));

vi.mock("next/cache", () => ({
    revalidateTag: vi.fn(),
}));

afterEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireServerActionAccessToken).mockResolvedValue({
        accessToken: "access-token",
        claims: { role: "admin" },
    });
});

test("submitUserCreateAction은 회장 세션이면 서비스 호출 없이 실패한다", async () => {
    vi.mocked(requireServerActionAccessToken).mockRejectedValue(new Error("Forbidden"));

    const result = await submitUserCreateAction({
        name: "운영자",
        login_id: "ops.admin",
        password: "password",
        phone: "010-1234-5678",
    });

    expect(result).toMatchObject({ ok: false });
    expect(createUserService).not.toHaveBeenCalled();
    expect(revalidateTag).not.toHaveBeenCalled();
});

test("submitUserCreateAction은 서비스 401이면 sessionExpired를 반환한다", async () => {
    vi.mocked(createUserService).mockResolvedValue({
        isSuccess: false,
        error: { status: 401, message: "Unauthorized", detail: "Unauthorized" },
    } as Awaited<ReturnType<typeof createUserService>>);

    const result = await submitUserCreateAction({
        name: "운영자",
        login_id: "ops.admin",
        password: "password",
        phone: "010-1234-5678",
    });

    expect(result).toMatchObject({ ok: false, sessionExpired: true });
    expect(revalidateTag).not.toHaveBeenCalled();
});

test("submitUserCreateAction은 관리자 계정을 생성한다", async () => {
    vi.mocked(createUserService).mockResolvedValue({
        isSuccess: true,
        result: {
            id: 1,
            name: "운영자",
            login_id: "ops.admin",
            password: "hashed-password",
            role: "admin",
            phone: "010-1234-5678",
            refresh_token: "",
            created_at: "2026-04-22T00:00:00.000Z",
            updated_at: "2026-04-22T00:00:00.000Z",
            deleted_at: null,
        },
    });

    await submitUserCreateAction({
        name: "운영자",
        login_id: "ops.admin",
        password: "password",
        phone: "010-1234-5678",
    });

    expect(createUserService).toHaveBeenCalledWith({
        name: "운영자",
        login_id: "ops.admin",
        password: "password",
        role: "admin",
        phone: "010-1234-5678",
    });
    expect(revalidateTag).toHaveBeenCalledWith("user");
});

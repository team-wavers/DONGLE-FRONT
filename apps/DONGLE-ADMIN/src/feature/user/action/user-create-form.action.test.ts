import { afterEach, expect, test, vi } from "vitest";
import { createUserService } from "@dongle/service/user/user.service";
import { userCreateFormAction } from "./user-create-form.action";

vi.mock("@dongle/service/user/user.service", () => ({
    createUserService: vi.fn(),
}));

vi.mock("@/feature/shared/action/server-action-auth", () => ({
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
});

test("userCreateFormAction은 role 입력값과 무관하게 관리자 계정을 생성한다", async () => {
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

    const formData = new FormData();
    formData.set("name", "운영자");
    formData.set("login_id", "ops.admin");
    formData.set("password", "password");
    formData.set("role", "president");
    formData.set("phone", "010-1234-5678");

    await userCreateFormAction({}, formData);

    expect(createUserService).toHaveBeenCalledWith({
        name: "운영자",
        login_id: "ops.admin",
        password: "password",
        role: "admin",
        phone: "010-1234-5678",
    });
});

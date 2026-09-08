import { afterEach, describe, expect, test, vi } from "vitest";
import { createMainBannerService } from "@dongle/service/main-banner/main-banner.service";
import { revalidateTag } from "next/cache";
import { submitMainBannerCreateAction } from "./main-banner-form.action";

vi.mock("@dongle/service/main-banner/main-banner.service", async () => {
    const actual = await vi.importActual<typeof import("@dongle/service/main-banner/main-banner.service")>(
        "@dongle/service/main-banner/main-banner.service"
    );
    return {
        ...actual,
        createMainBannerService: vi.fn(),
        updateMainBannerService: vi.fn(),
        uploadMainBannerImageService: vi.fn(),
    };
});

vi.mock("@/shared/action/server-action-auth", () => ({
    requireServerActionAccessToken: vi.fn().mockResolvedValue({
        accessToken: "access-token",
        claims: { role: "admin" },
    }),
}));

vi.mock("@/lib/sentry/capture-server-exception", () => ({
    captureServerException: vi.fn(),
}));

vi.mock("next/cache", () => ({
    revalidateTag: vi.fn(),
}));

describe("submitMainBannerCreateAction", () => {
    afterEach(() => {
        vi.clearAllMocks();
        vi.unstubAllEnvs();
    });

    test("서비스 401이면 sessionExpired를 반환하고 태그를 초기화하지 않는다", async () => {
        vi.stubEnv("NEXT_PUBLIC_S3_URL", "https://cdn.example.com/bucket");
        vi.mocked(createMainBannerService).mockResolvedValue({
            isSuccess: false,
            error: { status: 401, message: "Unauthorized", detail: "Unauthorized" },
        });

        const result = await submitMainBannerCreateAction({
            imageUrls: ["https://cdn.example.com/banner.png"],
            imageFile: null,
            link_url: "",
            publish_start_at: "2026-05-20 09:30:00",
            publish_end_at: "2026-05-21 09:30:00",
            is_active: true,
        });

        expect(result).toMatchObject({ ok: false, sessionExpired: true });
        expect(revalidateTag).not.toHaveBeenCalled();
    });
});

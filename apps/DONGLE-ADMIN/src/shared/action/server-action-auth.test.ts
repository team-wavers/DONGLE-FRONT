import { afterEach, describe, expect, it, vi } from "vitest";
import { getAccessTokenFromServerCookie } from "@dongle/api/utils/cookie/server-cookie.util";
import { verifyJwtToken } from "@dongle/api/utils/jwt.util";
import { AUTH_ROLE } from "@dongle/types/auth/auth-role";
import { requireServerActionAccessToken } from "./server-action-auth";

vi.mock("@dongle/api/utils/cookie/server-cookie.util", () => ({
    getAccessTokenFromServerCookie: vi.fn(),
}));

vi.mock("@dongle/api/utils/jwt.util", () => ({
    verifyJwtToken: vi.fn(),
}));

describe("requireServerActionAccessToken", () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it("rejects missing or unverified tokens before service work", async () => {
        vi.mocked(getAccessTokenFromServerCookie).mockResolvedValue(undefined as never);
        await expect(requireServerActionAccessToken()).rejects.toThrow("Unauthorized");

        vi.mocked(getAccessTokenFromServerCookie).mockResolvedValue("token");
        vi.mocked(verifyJwtToken).mockResolvedValue(null);
        await expect(requireServerActionAccessToken()).rejects.toThrow("Unauthorized");
        expect(verifyJwtToken).toHaveBeenCalledWith("token");
    });

    it("rejects president tokens from admin-only actions", async () => {
        vi.mocked(getAccessTokenFromServerCookie).mockResolvedValue("token");
        vi.mocked(verifyJwtToken).mockResolvedValue({
            role: AUTH_ROLE.PRESIDENT,
            club_id: 1,
        });

        await expect(requireServerActionAccessToken({ role: AUTH_ROLE.ADMIN })).rejects.toThrow("Forbidden");
    });

    it("rejects president tokens whose club_id does not match the resource", async () => {
        vi.mocked(getAccessTokenFromServerCookie).mockResolvedValue("token");
        vi.mocked(verifyJwtToken).mockResolvedValue({
            role: AUTH_ROLE.PRESIDENT,
            club_id: 1,
        });

        await expect(requireServerActionAccessToken({ clubId: 2 })).rejects.toThrow("Forbidden");
    });

    it("allows admins to act on any club resource", async () => {
        vi.mocked(getAccessTokenFromServerCookie).mockResolvedValue("token");
        vi.mocked(verifyJwtToken).mockResolvedValue({
            role: AUTH_ROLE.ADMIN,
            club_id: null,
        });

        await expect(requireServerActionAccessToken({ clubId: 2 })).resolves.toMatchObject({
            accessToken: "token",
            claims: { role: AUTH_ROLE.ADMIN },
        });
    });
});

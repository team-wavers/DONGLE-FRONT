import { afterEach, expect, test, vi } from "vitest";
import { getAccessTokenFromServerCookie } from "@dongle/api/utils/cookie/server-cookie.util";
import { verifyJwtToken } from "@dongle/api/utils/jwt.util";
import { notFound, redirect } from "next/navigation";
import { requireAdminPageAccess, requireClubPageAccess } from "./server-page-auth";

vi.mock("@dongle/api/utils/cookie/server-cookie.util", () => ({
    getAccessTokenFromServerCookie: vi.fn(),
}));

vi.mock("@dongle/api/utils/jwt.util", () => ({
    verifyJwtToken: vi.fn(),
}));

vi.mock("next/navigation", () => ({
    redirect: vi.fn((destination: string) => {
        throw new Error(`redirect:${destination}`);
    }),
    notFound: vi.fn(() => {
        throw new Error("notFound");
    }),
}));

afterEach(() => vi.clearAllMocks());

test("페이지 데이터 접근은 유효한 ADMIN JWT를 요구한다", async () => {
    vi.mocked(getAccessTokenFromServerCookie).mockResolvedValue("signed-token");
    const claims = { role: "admin" as const, user_id: 7 };
    vi.mocked(verifyJwtToken).mockResolvedValue(claims);

    await expect(requireAdminPageAccess()).resolves.toEqual({ accessToken: "signed-token", claims });
    expect(verifyJwtToken).toHaveBeenCalledWith("signed-token");
});

test("토큰이 없으면 기존 로그인 경로로 돌려보낸다", async () => {
    vi.mocked(getAccessTokenFromServerCookie).mockResolvedValue(undefined);

    await expect(requireAdminPageAccess()).rejects.toThrow("redirect:/login?reason=no_token");
    expect(verifyJwtToken).not.toHaveBeenCalled();
});

test("유효한 회장 토큰은 관리자 데이터에 접근하지 않고 동아리 폼으로 이동한다", async () => {
    vi.mocked(getAccessTokenFromServerCookie).mockResolvedValue("president-token");
    vi.mocked(verifyJwtToken).mockResolvedValue({ role: "president", club_id: 11 });

    await expect(requireAdminPageAccess()).rejects.toThrow("redirect:/11/club-form");
});

test("관리자 토큰은 clubId가 있어도 모든 동아리 경로 데이터에 접근할 수 있다", async () => {
    vi.mocked(getAccessTokenFromServerCookie).mockResolvedValue("admin-token");
    vi.mocked(verifyJwtToken).mockResolvedValue({ role: "admin" });

    await expect(requireAdminPageAccess({ clubId: 999 })).resolves.toMatchObject({ claims: { role: "admin" } });
    expect(redirect).not.toHaveBeenCalled();
});

test("clubId가 양의 안전 정수가 아니면 데이터를 조회하기 전에 404로 처리한다", async () => {
    vi.mocked(getAccessTokenFromServerCookie).mockResolvedValue("admin-token");
    vi.mocked(verifyJwtToken).mockResolvedValue({ role: "admin" });

    await expect(requireAdminPageAccess({ clubId: "../11" })).rejects.toThrow("notFound");
    expect(notFound).toHaveBeenCalledOnce();
});

test("회장은 검증된 claim의 clubId와 일치하는 동아리 데이터만 읽는다", async () => {
    vi.mocked(getAccessTokenFromServerCookie).mockResolvedValue("president-token");
    vi.mocked(verifyJwtToken).mockResolvedValue({ role: "president", club_id: "11" });

    await expect(requireClubPageAccess({ clubId: 11 })).resolves.toMatchObject({ claims: { club_id: "11" } });
    await expect(requireClubPageAccess({ clubId: 12 })).rejects.toThrow("redirect:/login?reason=unauthorized_club");
});

test("알 수 없거나 없는 role은 동아리 데이터에 접근할 수 없다", async () => {
    vi.mocked(getAccessTokenFromServerCookie).mockResolvedValue("unknown-role-token");
    vi.mocked(verifyJwtToken).mockResolvedValue({ club_id: 11 });

    await expect(requireClubPageAccess({ clubId: 11 })).rejects.toThrow("redirect:/login?reason=unauthorized_club");
});

test("관리자는 회장 경로에서도 다른 동아리 데이터를 읽을 수 있다", async () => {
    vi.mocked(getAccessTokenFromServerCookie).mockResolvedValue("admin-token");
    vi.mocked(verifyJwtToken).mockResolvedValue({ role: "admin", club_id: null });

    await expect(requireClubPageAccess({ clubId: 12 })).resolves.toMatchObject({ claims: { role: "admin" } });
});

test("서명 검증 실패는 페이지 데이터 접근을 거부한다", async () => {
    vi.mocked(getAccessTokenFromServerCookie).mockResolvedValue("invalid-token");
    vi.mocked(verifyJwtToken).mockResolvedValue(null);

    await expect(requireClubPageAccess({ clubId: 11 })).rejects.toThrow("redirect:/login?reason=invalid_token");
});

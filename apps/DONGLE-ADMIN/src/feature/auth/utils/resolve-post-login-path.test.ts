import { describe, expect, test } from "vitest";
import { AUTH_ROLE } from "@dongle/types/auth/auth-role";
import { resolvePostLoginPath } from "./resolve-post-login-path";

describe("resolvePostLoginPath", () => {
    test("회장에 clubId가 없고 returnTo가 있어도 no_club로 실패한다", () => {
        expect(
            resolvePostLoginPath({
                role: AUTH_ROLE.PRESIDENT,
                clubId: undefined,
                returnTo: "/99/club-form",
            })
        ).toEqual({ ok: false, reason: "no_club" });
        expect(
            resolvePostLoginPath({
                role: AUTH_ROLE.PRESIDENT,
                clubId: "",
                returnTo: "/admin/user",
            })
        ).toEqual({ ok: false, reason: "no_club" });
    });

    test("회장에 clubId가 있고 안전한 returnTo가 있으면 그 경로로 이동한다", () => {
        expect(
            resolvePostLoginPath({
                role: AUTH_ROLE.PRESIDENT,
                clubId: "12",
                returnTo: "/12/club-form",
            })
        ).toEqual({ ok: true, path: "/12/club-form" });
    });

    test("관리자에 안전한 returnTo가 있으면 그 경로로 이동한다", () => {
        expect(
            resolvePostLoginPath({
                role: AUTH_ROLE.ADMIN,
                returnTo: "/admin/user",
            })
        ).toEqual({ ok: true, path: "/admin/user" });
    });

    test("관리자는 /admin으로 이동한다", () => {
        expect(resolvePostLoginPath({ role: AUTH_ROLE.ADMIN })).toEqual({ ok: true, path: "/admin" });
    });

    test("회장에 clubId가 있으면 동아리 정보 수정 경로로 이동한다", () => {
        expect(resolvePostLoginPath({ role: AUTH_ROLE.PRESIDENT, clubId: "12" })).toEqual({
            ok: true,
            path: "/12/club-form",
        });
    });

    test("회장에 clubId가 없으면 no_club로 실패한다", () => {
        expect(resolvePostLoginPath({ role: AUTH_ROLE.PRESIDENT, clubId: undefined })).toEqual({
            ok: false,
            reason: "no_club",
        });
        expect(resolvePostLoginPath({ role: AUTH_ROLE.PRESIDENT, clubId: "" })).toEqual({
            ok: false,
            reason: "no_club",
        });
    });

    test("외부 URL returnTo는 무시하고 clubId 유무로 분기한다", () => {
        expect(
            resolvePostLoginPath({
                role: AUTH_ROLE.PRESIDENT,
                clubId: "3",
                returnTo: "https://evil.example",
            })
        ).toEqual({ ok: true, path: "/3/club-form" });
    });
});

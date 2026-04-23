import { expect, test } from "vitest";
import type { User } from "@dongle/types/user/user.d";
import { filterUsersByKeyword, normalizeUserKeyword } from "./filterable-user-list";

const users = [
    {
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
    {
        id: 2,
        name: "회장",
        login_id: "club.president",
        password: "hashed-password",
        role: "president",
        phone: "010-9876-5432",
        refresh_token: "",
        created_at: "2026-04-22T00:00:00.000Z",
        updated_at: "2026-04-22T00:00:00.000Z",
        deleted_at: null,
        club: {
            id: 10,
            name: "디메이커",
        },
    },
] as User[];

test("normalizeUserKeyword는 공백과 대소문자를 정규화한다", () => {
    expect(normalizeUserKeyword("  OPS  ")).toBe("ops");
});

test("filterUsersByKeyword는 이름, 로그인 ID, 전화번호, 역할, 동아리명을 기준으로 검색한다", () => {
    expect(filterUsersByKeyword(users, "운영").map((user) => user.id)).toEqual([1]);
    expect(filterUsersByKeyword(users, "ops.admin").map((user) => user.id)).toEqual([1]);
    expect(filterUsersByKeyword(users, "9876").map((user) => user.id)).toEqual([2]);
    expect(filterUsersByKeyword(users, "관리자").map((user) => user.id)).toEqual([1]);
    expect(filterUsersByKeyword(users, "디메이커").map((user) => user.id)).toEqual([2]);
});

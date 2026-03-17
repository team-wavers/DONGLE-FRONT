import { expect, test } from "@playwright/test";
import { gotoAdminLogin, loginAsAdmin } from "../fixtures/admin.fixture";

test.describe("admin auth", () => {
    test("로그인 페이지가 렌더링된다", async ({ page }) => {
        await gotoAdminLogin(page);

        await expect(page.getByPlaceholder("비밀번호")).toBeVisible();
        await expect(page.getByRole("button", { name: "로그인" })).toBeVisible();
    });

    test("관리자 계정으로 로그인할 수 있다", async ({ page }) => {
        await loginAsAdmin(page);

        await expect(page).toHaveURL(/\/admin$/);
        await expect(page.getByRole("heading", { name: "관리자 메뉴" })).toBeVisible();
    });
});

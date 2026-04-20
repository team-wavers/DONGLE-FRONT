import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "../fixtures/admin.fixture";

test.describe("admin auth", () => {
    test("관리자 계정으로 로그인할 수 있다", async ({ page }) => {
        await loginAsAdmin(page);

        await expect(page).toHaveURL(/\/admin$/);
        await expect(page.getByRole("heading", { name: "관리자 메뉴" })).toBeVisible();
    });
});

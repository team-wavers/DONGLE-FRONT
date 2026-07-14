import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "../fixtures/admin.fixture";

test.describe("admin auth", () => {
    /** 로그인 자체를 검증하는 테스트이므로 project storageState를 쓰지 않고 매번 실제 로그인한다 */
    test.use({ storageState: { cookies: [], origins: [] } });

    test("관리자 계정으로 로그인할 수 있다", async ({ page }) => {
        await loginAsAdmin(page);

        await expect(page).toHaveURL(/\/admin$/);
        await expect(page.getByRole("heading", { name: "관리자 메뉴" })).toBeVisible();
    });
});

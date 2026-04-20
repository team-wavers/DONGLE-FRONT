import { expect, test } from "@playwright/test";
import { gotoClientHome } from "../fixtures/client.fixture";

test.describe("client smoke", () => {
    test("메인 페이지가 렌더링된다", async ({ page }) => {
        await gotoClientHome(page);

        await expect(page.getByPlaceholder("동아리명, 분과를 입력해 보세요")).toBeVisible();
        await expect(page.locator("#club-search-section")).toBeVisible();
    });
});

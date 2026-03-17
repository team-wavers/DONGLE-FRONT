import { expect, test } from "@playwright/test";
import { openFirstAdminClub } from "../fixtures/admin.fixture";

test.describe("admin report management", () => {
    test("동아리 상세에서 활동보고서 관리 탭으로 이동할 수 있다", async ({ page }) => {
        await openFirstAdminClub(page);

        await page.locator('a[href$="/report"]').filter({ hasText: "활동보고서 관리" }).first().click();

        await expect(page).toHaveURL(/\/admin\/club\/\d+\/report$/);

        const reportList = page.locator('a[href*="/report/"]').first();
        const emptyState = page.getByText("등록된 활동 보고서가 없습니다.");
        await expect(reportList.or(emptyState)).toBeVisible();
    });
});

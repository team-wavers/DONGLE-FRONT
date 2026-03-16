import { expect, test } from "@playwright/test";
import { gotoAdminClubManagement } from "../fixtures/admin.fixture";

test.describe("admin club management", () => {
    test("동아리 관리 페이지가 렌더링된다", async ({ page }) => {
        await gotoAdminClubManagement(page);

        await expect(page.getByText("동아리 정보와 활동보고서를 관리할 수 있습니다.")).toBeVisible();
        await expect(page.getByPlaceholder("동아리명, 분과 검색")).toBeVisible();
    });

    test("동아리 검색 결과 없음 상태를 확인할 수 있다", async ({ page }) => {
        await gotoAdminClubManagement(page);

        await page.getByPlaceholder("동아리명, 분과 검색").fill("없는동아리");
        await expect(page.getByText("검색 조건에 맞는 동아리가 없습니다.")).toBeVisible({ timeout: 10000 });
    });
});

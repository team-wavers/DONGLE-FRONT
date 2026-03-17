import { expect, test } from "@playwright/test";
import { getLoggedInClubId, gotoClubReportList } from "../fixtures/club.fixture";

test.describe("club report", () => {
    test("활동보고서 목록 화면이 렌더링된다", async ({ page }) => {
        await gotoClubReportList(page);

        await expect(page.getByRole("button", { name: "작성하기" })).toBeVisible();
    });

    test("활동보고서 작성 화면으로 이동할 수 있다", async ({ page }) => {
        await gotoClubReportList(page);

        const clubId = await getLoggedInClubId(page);
        await page.getByRole("button", { name: "작성하기" }).click();

        await expect(page).toHaveURL(new RegExp(`/${clubId}/create$`));
        await expect(page.getByRole("heading", { name: "활동보고서 작성" })).toBeVisible();
        await expect(page.getByLabel("보고서 제목")).toBeVisible();
        await expect(page.locator(".ProseMirror")).toBeVisible();
    });

    test("활동보고서를 작성한 뒤 삭제할 수 있다", async ({ page }) => {
        await gotoClubReportList(page);

        const clubId = await getLoggedInClubId(page);
        const reportTitle = `E2E 보고서 ${Date.now()}`;
        const reportContent = "E2E 활동보고서 본문입니다. 작성과 삭제 흐름을 검증합니다.";

        await page.getByRole("button", { name: "작성하기" }).click();

        await expect(page).toHaveURL(new RegExp(`/${clubId}/create$`));
        await page.getByLabel("보고서 제목").fill(reportTitle);

        const editor = page.locator(".ProseMirror");
        await editor.click();
        await editor.pressSequentially(reportContent);

        await page.getByRole("button", { name: "등록" }).click();

        await expect(page).toHaveURL(new RegExp(`/${clubId}/report$`));

        const createdReportCard = page.getByRole("link", { name: new RegExp(reportTitle) });
        await expect(createdReportCard).toBeVisible();
        await createdReportCard.click();

        await expect(page).toHaveURL(new RegExp(`/${clubId}/report/\\d+$`));
        await expect(page.getByText(reportTitle)).toBeVisible();
        await page.getByRole("button", { name: "삭제하기" }).click();
        await page.getByRole("button", { name: "삭제하기" }).last().click();

        await expect(page).toHaveURL(new RegExp(`/${clubId}/report$`));
        await expect(page.getByRole("link", { name: new RegExp(reportTitle) })).toHaveCount(0);
    });
});

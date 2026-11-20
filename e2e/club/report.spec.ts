import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";
import { getLoggedInClubId, gotoClubReportList } from "../fixtures/club.fixture";

test.describe("club report", () => {
    let pendingCleanup: { listUrl: string; title: string } | undefined;

    test.afterEach(async ({ context }) => {
        if (!pendingCleanup) {
            return;
        }

        const { listUrl, title } = pendingCleanup;
        pendingCleanup = undefined;
        const cleanupPage = await context.newPage();
        await cleanupPage.goto(listUrl, { waitUntil: "domcontentloaded" });
        await expect(cleanupPage.getByText(/개의 활동보고서/)).toBeVisible();

        const leftoverReport = cleanupPage
            .getByRole("link")
            .filter({ has: cleanupPage.getByText(title, { exact: true }) });
        if ((await leftoverReport.count()) === 0) {
            return;
        }

        await leftoverReport.click();
        await cleanupPage.getByRole("button", { name: "삭제하기" }).click();
        await cleanupPage
            .getByRole("dialog", { name: "보고서 삭제" })
            .getByRole("button", { name: "삭제하기" })
            .click();
        await expect(cleanupPage).toHaveURL(listUrl);
        await expect(cleanupPage.getByText(/개의 활동보고서/)).toBeVisible();
        await expect(leftoverReport).toHaveCount(0);
    });

    test("활동보고서를 작성한 뒤 삭제할 수 있다", async ({ page }) => {
        await gotoClubReportList(page);

        const listUrl = page.url();
        const clubId = await getLoggedInClubId(page);
        const reportTitle = `E2E 보고서 ${randomUUID()}`;
        const reportContent = "E2E 활동보고서 본문입니다. 작성과 삭제 흐름을 검증합니다.";

        await page.getByRole("link", { name: "작성하기" }).click();

        await expect(page).toHaveURL(new RegExp(`/${clubId}/create$`));
        await page.getByLabel("보고서 제목").fill(reportTitle);

        const editor = page.locator(".ProseMirror");
        await editor.click();
        await editor.pressSequentially(reportContent);

        pendingCleanup = { listUrl, title: reportTitle };
        await page.getByRole("button", { name: "등록" }).click();

        await expect(page).toHaveURL(new RegExp(`/${clubId}/report$`));

        const createdReportCard = page.getByRole("link").filter({ has: page.getByText(reportTitle, { exact: true }) });
        await expect(createdReportCard).toBeVisible();
        await createdReportCard.click();

        await expect(page).toHaveURL(new RegExp(`/${clubId}/report/\\d+$`));
        await expect(page.getByText(reportTitle)).toBeVisible();
        await page.getByRole("button", { name: "삭제하기" }).click();
        await page.getByRole("dialog", { name: "보고서 삭제" }).getByRole("button", { name: "삭제하기" }).click();

        await expect(page).toHaveURL(listUrl);
        await expect(page.getByText(/개의 활동보고서/)).toBeVisible();
        await expect(createdReportCard).toHaveCount(0);

        pendingCleanup = undefined;
    });
});

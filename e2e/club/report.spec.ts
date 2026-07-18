import { expect, test } from "@playwright/test";
import { getLoggedInClubId, gotoClubReportList } from "../fixtures/club.fixture";

test.describe("club report", () => {
    /** 테스트 중간에 assertion이 실패해도 생성된 보고서가 E2E 환경에 남지 않도록 best-effort로 정리한다 */
    let pendingCleanupTitle: string | undefined;

    test.afterEach(async ({ page }) => {
        if (!pendingCleanupTitle) {
            return;
        }

        const titleToClean = pendingCleanupTitle;
        pendingCleanupTitle = undefined;

        try {
            const clubId = await getLoggedInClubId(page);
            await page.goto(`/${clubId}/report`, { waitUntil: "domcontentloaded" });

            const leftoverReport = page.getByRole("link", { name: new RegExp(titleToClean) }).first();
            if ((await leftoverReport.count()) === 0) {
                return;
            }

            await leftoverReport.click();
            await page.getByRole("button", { name: "삭제하기" }).click();
            await page.getByRole("button", { name: "삭제하기" }).last().click();
        } catch {
            // 정리 실패는 테스트 결과에 영향을 주지 않는다. 다음 실행에서도 재시도된다.
        }
    });

    test("활동보고서를 작성한 뒤 삭제할 수 있다", async ({ page }) => {
        await gotoClubReportList(page);

        const clubId = await getLoggedInClubId(page);
        const reportTitle = `E2E 보고서 ${Date.now()}`;
        const reportContent = "E2E 활동보고서 본문입니다. 작성과 삭제 흐름을 검증합니다.";
        pendingCleanupTitle = reportTitle;

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

        pendingCleanupTitle = undefined;
    });
});

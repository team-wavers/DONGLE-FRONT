import { expect, test } from "@playwright/test";
import { gotoClubForm } from "../fixtures/club.fixture";

test.describe("club form", () => {
    let originalInstagram: { url: string; value: string } | undefined;

    test.afterEach(async ({ context }) => {
        if (!originalInstagram) {
            return;
        }

        const { url, value } = originalInstagram;
        originalInstagram = undefined;
        const cleanupPage = await context.newPage();
        await cleanupPage.goto(url, { waitUntil: "domcontentloaded" });
        const form = cleanupPage.locator("form").first();
        const instagramField = form.locator("#instagram");

        if ((await instagramField.inputValue()) === value) {
            return;
        }

        await instagramField.fill(value);
        await form.getByRole("button", { name: "동아리 정보 수정" }).click();
        await expect(cleanupPage.getByText(/^동아리 정보가 성공적으로 수정되었습니다/)).toBeVisible();
        await cleanupPage.reload({ waitUntil: "domcontentloaded" });
        await expect(instagramField).toHaveValue(value);
    });

    test("동아리 정보를 성공적으로 수정할 수 있다", async ({ page }) => {
        await gotoClubForm(page);

        const clubInfoForm = page.locator("form").first();
        const instagramField = clubInfoForm.locator("#instagram");
        const submitButton = clubInfoForm.getByRole("button", { name: "동아리 정보 수정" });
        const currentInstagram = await instagramField.inputValue();
        const updatedInstagram =
            currentInstagram === "https://instagram.com/dongle_e2e_a"
                ? "https://instagram.com/dongle_e2e_b"
                : "https://instagram.com/dongle_e2e_a";

        await instagramField.fill(updatedInstagram);
        originalInstagram = { url: page.url(), value: currentInstagram };
        await submitButton.click();
        await expect(page.getByText(/^동아리 정보가 성공적으로 수정되었습니다/)).toBeVisible();
        await expect
            .poll(
                async () => {
                    await page.reload({ waitUntil: "domcontentloaded" });
                    return page.locator("#instagram").inputValue();
                },
                { timeout: 10000 }
            )
            .toBe(updatedInstagram);
    });
});

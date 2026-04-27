import { expect, test } from "@playwright/test";
import { gotoClubForm } from "../fixtures/club.fixture";

test.describe("club form", () => {
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
        await submitButton.click();
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

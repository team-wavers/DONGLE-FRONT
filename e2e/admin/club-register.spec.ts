import { expect, test } from "@playwright/test";
import { gotoAdminClubRegister } from "../fixtures/admin.fixture";

test.describe("admin club register", () => {
    test("등록 URL을 성공적으로 생성할 수 있다", async ({ page }) => {
        await page.addInitScript(() => {
            const originalFetch = window.fetch.bind(window);
            const registrationUrlResponse = {
                isSuccess: true,
                result: "https://api.example.com/club-register?key=e2e-registration-key",
            };

            window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
                const requestUrl =
                    typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

                if (
                    requestUrl.endsWith("/api/clubs/registration-urls") ||
                    requestUrl === "/api/clubs/registration-urls"
                ) {
                    return new Response(JSON.stringify(registrationUrlResponse), {
                        status: 200,
                        headers: {
                            "Content-Type": "application/json",
                        },
                    });
                }

                return originalFetch(input, init);
            };

            Object.defineProperty(navigator, "clipboard", {
                configurable: true,
                value: {
                    writeText: async () => undefined,
                },
            });
        });
        await gotoAdminClubRegister(page);
        await expect(page.getByText("동아리 등록을 위한 임시 URL을 생성하고 관리할 수 있습니다")).toBeVisible();
        await page.waitForTimeout(300);

        await page.getByRole("button", { name: "등록 URL 생성" }).click();

        const registerUrlInput = page.locator("#register-url");
        await expect(registerUrlInput).toBeVisible({ timeout: 10000 });
        await expect(registerUrlInput).toHaveValue("http://127.0.0.1:4001/club-register/e2e-registration-key");
    });
});

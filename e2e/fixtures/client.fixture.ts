import { expect, type Page } from "@playwright/test";
import { clientRoutes } from "../utils/routes";

export async function gotoClientHome(page: Page) {
    await page.goto(clientRoutes.home);
    await expect(page.getByPlaceholder("동아리명, 분과를 입력해 보세요")).toBeVisible();
}

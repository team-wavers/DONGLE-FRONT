import { expect, type Page } from "@playwright/test";
import { adminRoutes } from "../utils/routes";

export async function gotoAdminLogin(page: Page) {
    await page.goto(adminRoutes.login);
    await expect(page.getByPlaceholder("아이디")).toBeVisible();
}

function getAdminCredentials() {
    const username = process.env.E2E_ADMIN_USERNAME;
    const password = process.env.E2E_ADMIN_PASSWORD;

    if (!username || !password) {
        throw new Error("E2E_ADMIN_USERNAME, E2E_ADMIN_PASSWORD 환경변수가 필요합니다.");
    }

    return { username, password };
}

export async function loginAsAdmin(page: Page) {
    const { username, password } = getAdminCredentials();

    await gotoAdminLogin(page);
    await page.getByPlaceholder("아이디").fill(username);
    await page.getByPlaceholder("비밀번호").fill(password);
    await page.getByRole("button", { name: "로그인" }).click();

    await page.waitForURL(`**${adminRoutes.home}`);
}

export async function gotoAdminClubManagement(page: Page) {
    await loginAsAdmin(page);
    await page.goto(adminRoutes.clubManagement, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "동아리 관리" })).toBeVisible();
}

export async function gotoAdminClubRegister(page: Page) {
    await loginAsAdmin(page);
    await page.goto(adminRoutes.clubRegister, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "동아리 등록" })).toBeVisible();
}

export async function openFirstAdminClub(page: Page) {
    await gotoAdminClubManagement(page);

    const firstClubTitle = page.locator('[data-slot="card"].cursor-pointer [data-slot="card-title"]').first();
    await expect(firstClubTitle).toBeVisible();
    await firstClubTitle.click();

    await expect(page).toHaveURL(/\/admin\/club\/\d+$/);
    await expect(page.locator('a[href^="/admin/club/"]').filter({ hasText: "동아리 정보관리" }).first()).toBeVisible();
}

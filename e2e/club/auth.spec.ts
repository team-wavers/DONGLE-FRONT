import { expect, test } from "@playwright/test";
import { gotoClubLogin, loginAsClub } from "../fixtures/club.fixture";

test.describe("club auth", () => {
    test("로그인 페이지가 렌더링된다", async ({ page }) => {
        await gotoClubLogin(page);

        await expect(page.getByPlaceholder("비밀번호")).toBeVisible();
        await expect(page.getByRole("button", { name: "로그인" })).toBeVisible();
    });

    test("회장 계정으로 로그인하면 동아리 정보 관리로 이동한다", async ({ page }) => {
        await loginAsClub(page);

        await expect(page).toHaveURL(/\/\d+\/club-form$/);
        await expect(page.getByRole("button", { name: "동아리 정보 수정" })).toBeVisible();
    });
});

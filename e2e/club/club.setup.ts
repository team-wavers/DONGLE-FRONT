import { test as setup } from "@playwright/test";
import { loginAsClub } from "../fixtures/club.fixture";
import { CLUB_AUTH_FILE } from "../utils/auth-files";

setup("동아리 회장 인증 상태를 저장한다", async ({ page }) => {
    await loginAsClub(page);
    await page.context().storageState({ path: CLUB_AUTH_FILE });
});

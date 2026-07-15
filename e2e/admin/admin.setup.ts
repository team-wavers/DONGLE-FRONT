import { test as setup } from "@playwright/test";
import { loginAsAdmin } from "../fixtures/admin.fixture";
import { ADMIN_AUTH_FILE } from "../utils/auth-files";

setup("관리자 인증 상태를 저장한다", async ({ page }) => {
    await loginAsAdmin(page);
    await page.context().storageState({ path: ADMIN_AUTH_FILE });
});

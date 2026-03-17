import { expect, type Page } from "@playwright/test";

function getClubCredentials() {
    const username = process.env.E2E_CLUB_USERNAME;
    const password = process.env.E2E_CLUB_PASSWORD;

    if (!username || !password) {
        throw new Error("E2E_CLUB_USERNAME, E2E_CLUB_PASSWORD 환경변수가 필요합니다.");
    }

    return { username, password };
}

function getClubIdFromPath(pathname: string) {
    const match = pathname.match(/^\/(\d+)\//);
    return match?.[1];
}

export async function gotoClubLogin(page: Page) {
    await page.goto("/login");
    await expect(page.getByPlaceholder("아이디")).toBeVisible();
}

export async function loginAsClub(page: Page) {
    const { username, password } = getClubCredentials();

    await gotoClubLogin(page);
    await page.getByPlaceholder("아이디").fill(username);
    await page.getByPlaceholder("비밀번호").fill(password);
    await page.getByRole("button", { name: "로그인" }).click();
    await page.waitForURL(/\/\d+\/club-form$/);
}

export async function getLoggedInClubId(page: Page) {
    const clubId = getClubIdFromPath(new URL(page.url()).pathname);

    if (!clubId) {
        throw new Error(`현재 URL에서 clubId를 찾을 수 없습니다: ${page.url()}`);
    }

    return clubId;
}

export async function gotoClubForm(page: Page) {
    await loginAsClub(page);
    await expect(page.getByRole("button", { name: "동아리 정보 수정" })).toBeVisible();
}

export async function gotoClubReportList(page: Page) {
    await loginAsClub(page);

    const clubId = await getLoggedInClubId(page);
    await page.goto(`/${clubId}/report`, { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("button", { name: "작성하기" })).toBeVisible();
}

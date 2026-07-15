import { expect, test, type Page } from "@playwright/test";
import { gotoClientHome } from "../fixtures/client.fixture";

function getSearchInput(page: Page) {
    return page.getByPlaceholder("동아리명, 분과를 입력해 보세요");
}

function getSearchParam(page: Page, key: string) {
    return new URL(page.url()).searchParams.get(key);
}

async function getFirstClubName(page: Page) {
    const firstClubName = await page.locator("[data-testid='club-list'] h3").first().textContent();

    if (!firstClubName) {
        throw new Error("동아리 목록이 비어 있어 검색 테스트를 진행할 수 없습니다.");
    }

    return firstClubName;
}

test.describe("club search filters", { tag: "@smoke" }, () => {
    test("검색어를 입력하면 debounce 후 URL과 목록이 갱신된다", async ({ page }) => {
        await gotoClientHome(page);

        const clubName = await getFirstClubName(page);
        const searchInput = getSearchInput(page);

        await searchInput.fill(clubName);

        await expect.poll(() => getSearchParam(page, "q")).toBe(clubName);
        await expect(page.locator("[data-testid='club-list'] h3", { hasText: clubName }).first()).toBeVisible();
        await expect(page.getByText(/^검색 결과/)).toBeVisible();

        await searchInput.fill("");

        await expect.poll(() => getSearchParam(page, "q")).toBeNull();
    });

    test("모집 상태 필터를 선택하면 URL에 반영되고 해제하면 제거된다", async ({ page }) => {
        await gotoClientHome(page);

        await page.getByRole("button", { name: "모집여부: 모집중" }).click();

        await expect.poll(() => getSearchParam(page, "status")).toBe("recruiting");
        await expect(page.getByText(/^모집중 \d+개/)).toBeVisible();

        await page.getByRole("button", { name: "모집여부: 전체" }).click();

        await expect.poll(() => getSearchParam(page, "status")).toBeNull();
    });

    test("필터 딥링크로 진입하면 검색어와 필터 상태가 복원된다", async ({ page }) => {
        await gotoClientHome(page);

        const clubName = await getFirstClubName(page);

        await page.goto(`/?q=${encodeURIComponent(clubName)}&status=recruiting`);

        await expect(getSearchInput(page)).toHaveValue(clubName);
        await expect(page.getByRole("button", { name: "모집여부: 모집중" })).toHaveAttribute("aria-pressed", "true");
    });
});

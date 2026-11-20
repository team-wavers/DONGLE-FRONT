import { expect, test, type BrowserContext, type APIRequestContext, type APIResponse } from "@playwright/test";
import { readDevEnvironment } from "../fixtures/dev-environment";

const target = readDevEnvironment(process.env);

async function resultOf(response: APIResponse) {
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.isSuccess).toBe(true);
    return body.result;
}

function assertPublicUser(user: Record<string, unknown>) {
    expect(Object.hasOwn(user, "password")).toBe(false);
    expect(Object.hasOwn(user, "refresh_token")).toBe(false);
}

async function apiGet(api: APIRequestContext, path: string, accessToken?: string) {
    try {
        return await api.get(`${target.apiUrl}${path}`, {
            headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
            maxRedirects: 0,
        });
    } catch {
        throw new Error(`dev API request failed: ${path}`);
    }
}

async function readAdminHealth(api: APIRequestContext) {
    const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
    let response: APIResponse;
    try {
        response = await api.get(`${target.adminUrl}/api/health`, {
            maxRedirects: 0,
            headers: bypass ? { "x-vercel-protection-bypass": bypass } : {},
        });
    } catch {
        throw new Error("dev ADMIN health request failed");
    }
    expect(response.status()).toBe(200);
    return response.json();
}

async function login(context: BrowserContext, username: string, password: string, path: RegExp) {
    const page = await context.newPage();
    await page.goto("/login");
    await page.getByPlaceholder("아이디").fill(username);
    try {
        await page.getByPlaceholder("비밀번호").fill(password);
    } catch {
        throw new Error("dev login password field was unavailable");
    }
    await page.getByRole("button", { name: "로그인" }).click();
    await expect(page).toHaveURL(path);
    const cookies = await context.cookies(target.adminUrl);
    const access = cookies.find((cookie) => cookie.name === "accessToken");
    const refresh = cookies.find((cookie) => cookie.name === "refreshToken");
    expect(Boolean(access?.value && refresh?.value)).toBe(true);
    expect(access?.httpOnly && refresh?.httpOnly).toBe(true);
    expect(access?.secure && refresh?.secure).toBe(true);
    return { page, token: access!.value };
}

test("dev 배포의 로그인·서버 인가·사용자 응답을 검증한다", async ({ browser, playwright }) => {
    const adminContext = await browser.newContext({ baseURL: target.adminUrl });
    const clubContext = await browser.newContext({ baseURL: target.adminUrl });
    const api = await playwright.request.newContext();
    let serverRelease: string;
    let frontRelease: string;
    try {
        for (const context of [adminContext, clubContext]) {
            await context.route("**/*", async (route) => {
                const request = route.request();
                const headers = { ...request.headers() };
                const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
                if (new URL(request.url()).origin === target.adminUrl && bypass) {
                    headers["x-vercel-protection-bypass"] = bypass;
                } else {
                    delete headers["x-vercel-protection-bypass"];
                }
                await route.continue({ headers });
            });
        }
        await test.step("dev API와 시드 준비 상태 확인", async () => {
            const health = await resultOf(await apiGet(api, "/healthCheck"));
            expect(health.status).toBe("ok");
            expect(health.environment).toBe("development");
            expect(health.release).toMatch(/^[a-f0-9]{40}$/);
            serverRelease = health.release;
            if (process.env.EXPECTED_SERVER_SHA) expect(health.release).toBe(process.env.EXPECTED_SERVER_SHA);
            const adminHealth = await readAdminHealth(api);
            expect(adminHealth.app).toBe("dongle-admin");
            expect(adminHealth.ok).toBe(true);
            expect(adminHealth.deploymentSha).toMatch(/^[a-f0-9]{40}$/);
            frontRelease = adminHealth.deploymentSha;
            if (process.env.EXPECTED_FRONT_SHA) expect(adminHealth.deploymentSha).toBe(process.env.EXPECTED_FRONT_SHA);
        });
        const clubs = (await resultOf(await apiGet(api, "/clubs"))) as Array<{
            id: number;
            name: string;
            tags: string[];
        }>;
        const ownClubs = clubs.filter(
            (club) => club.name === "E2E 권한 검증 동아리 A" && club.tags?.includes("dev-e2e")
        );
        const otherClubs = clubs.filter(
            (club) => club.name === "E2E 권한 검증 동아리 B" && club.tags?.includes("dev-e2e")
        );
        expect(ownClubs.length).toBe(1);
        expect(otherClubs.length).toBe(1);
        const ownClubId = ownClubs[0].id;
        const otherClubId = otherClubs[0].id;

        await test.step("관리자 UI 로그인과 사용자 목록", async () => {
            const { page, token } = await login(adminContext, target.adminUsername, target.adminPassword, /\/admin$/);
            const users = (await resultOf(await apiGet(api, "/users", token))) as Array<Record<string, unknown>>;
            expect(users.some((user) => user.login_id === target.clubUsername)).toBe(true);
            users.forEach(assertPublicUser);
            await page.goto("/admin/user");
            await expect(page.getByText(target.clubUsername, { exact: true })).toBeVisible();
            await page.close();
        });
        await test.step("회장 로그인과 본인 동아리·사용자 정보 조회", async () => {
            const { page, token } = await login(
                clubContext,
                target.clubUsername,
                target.clubPassword,
                new RegExp(`/${ownClubId}/club-form$`)
            );
            await expect(page.getByRole("button", { name: "동아리 정보 수정" })).toBeVisible();
            const detail = await resultOf(await apiGet(api, `/clubs/${ownClubId}`));
            expect(detail.president.login_id === undefined).toBe(true);
            assertPublicUser(detail.president);
            const self = await resultOf(await apiGet(api, `/users/${detail.president.id}`, token));
            expect(self.login_id === target.clubUsername).toBe(true);
            assertPublicUser(self);
            await resultOf(await apiGet(api, `/clubs/${ownClubId}/schedules`, token));
            expect((await apiGet(api, "/users", token)).status()).toBe(403);
            expect((await apiGet(api, `/clubs/${otherClubId}/schedules`, token)).status()).toBe(403);
            await page.goto(`/${otherClubId}/club-form`);
            await expect(page).toHaveURL(/\/login\?reason=unauthorized_club$/);
            await page.close();
        });
        await test.step("검사 도중 배포가 교체되지 않았는지 확인", async () => {
            const server = await resultOf(await apiGet(api, "/healthCheck"));
            const admin = await readAdminHealth(api);
            expect(server.release).toBe(serverRelease);
            expect(admin.deploymentSha).toBe(frontRelease);
        });
    } finally {
        await api.dispose();
        await adminContext.close();
        await clubContext.close();
    }
});

function required(env: NodeJS.ProcessEnv, key: string): string {
    const value = env[key];
    if (!value?.trim()) throw new Error(`${key} is required for dev E2E`);
    return value;
}

export function readDevEnvironment(env: NodeJS.ProcessEnv) {
    const adminUrl = new URL(required(env, "E2E_ADMIN_URL"));
    const apiUrl = new URL(required(env, "E2E_API_URL"));
    for (const url of [adminUrl, apiUrl]) {
        if (
            url.protocol !== "https:" ||
            url.username ||
            url.password ||
            url.search ||
            url.hash ||
            ["dongle.wavers.kr", "admin.dongle.wavers.kr", "api.dongle.wavers.kr"].includes(url.hostname)
        ) {
            throw new Error("Use an explicit HTTPS dev target without embedded credentials");
        }
    }
    if (adminUrl.pathname !== "/" || apiUrl.pathname.replace(/\/$/, "") !== "/v1") {
        throw new Error("ADMIN must be an origin and API must end in /v1");
    }
    return {
        adminUrl: adminUrl.origin,
        apiUrl: apiUrl.href.replace(/\/$/, ""),
        adminUsername: "dongle_e2e_admin",
        clubUsername: "dongle_e2e_president",
        adminPassword: required(env, "E2E_ADMIN_PASSWORD"),
        clubPassword: required(env, "E2E_CLUB_PASSWORD"),
    };
}

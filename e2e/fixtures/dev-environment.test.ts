import { describe, expect, test } from "vitest";
import { readDevEnvironment } from "./dev-environment";

const env = {
    E2E_ADMIN_URL: "https://admin-dev.example.com",
    E2E_API_URL: "https://api-dev.example.com/v1",
    E2E_ADMIN_PASSWORD: "admin-secret",
    E2E_CLUB_PASSWORD: "president-secret",
};

describe("dev E2E environment", () => {
    test("uses dev URLs and the seeded account identities", () => {
        expect(readDevEnvironment(env)).toMatchObject({
            adminUrl: env.E2E_ADMIN_URL,
            apiUrl: env.E2E_API_URL,
            adminUsername: "dongle_e2e_admin",
            clubUsername: "dongle_e2e_president",
        });
    });

    test.each([
        "http://localhost:4001",
        "https://admin.dongle.wavers.kr",
        "https://user:pass@admin-dev.example.com",
        "https://admin-dev.example.com/path",
    ])("rejects unsafe ADMIN target %s", (url) => {
        expect(() => readDevEnvironment({ ...env, E2E_ADMIN_URL: url })).toThrow();
    });

    test("requires credentials and an explicit versioned API target", () => {
        expect(() => readDevEnvironment({ ...env, E2E_API_URL: "https://api-dev.example.com" })).toThrow();
        expect(() => readDevEnvironment({ ...env, E2E_CLUB_PASSWORD: "" })).toThrow();
    });
});

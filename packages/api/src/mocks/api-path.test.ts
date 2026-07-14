import { describe, expect, test } from "vitest";
import { apiPath } from "./api-path";
import { isMswEnabled } from "./is-msw-enabled";
import authHandlers from "./handlers/auth";

describe("apiPath", () => {
    test("/v1 prefix와 호스트 와일드카드를 붙인다", () => {
        expect(apiPath("/clubs")).toBe("*/v1/clubs");
        expect(apiPath("/auth/login")).toBe("*/v1/auth/login");
        expect(apiPath("/clubs/:id")).toBe("*/v1/clubs/:id");
    });
});

describe("isMswEnabled", () => {
    test("NEXT_PUBLIC_USE_MSW=1 일 때만 true", () => {
        const previous = process.env["NEXT_PUBLIC_USE_MSW"];
        process.env["NEXT_PUBLIC_USE_MSW"] = "1";
        expect(isMswEnabled()).toBe(true);
        process.env["NEXT_PUBLIC_USE_MSW"] = "0";
        expect(isMswEnabled()).toBe(false);
        delete process.env["NEXT_PUBLIC_USE_MSW"];
        expect(isMswEnabled()).toBe(false);
        if (previous === undefined) {
            delete process.env["NEXT_PUBLIC_USE_MSW"];
        } else {
            process.env["NEXT_PUBLIC_USE_MSW"] = previous;
        }
    });
});

describe("auth handlers", () => {
    test("auth path는 /v1 을 포함한다", () => {
        const infos = authHandlers.map((handler) => handler.info.path);
        expect(infos).toEqual(["*/v1/auth/login", "*/v1/auth/refresh", "*/v1/auth/logout"]);
    });
});

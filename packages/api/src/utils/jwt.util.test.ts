import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyJwtToken } from "./jwt.util";

function encode(value: unknown) {
    return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function sign(payload: Record<string, unknown>, secret: string) {
    const unsigned = `${encode({ alg: "HS256", typ: "JWT" })}.${encode(payload)}`;
    const signature = createHmac("sha256", secret).update(unsigned).digest("base64url");
    return `${unsigned}.${signature}`;
}

describe("verifyJwtToken", () => {
    it("returns claims only for a correctly signed HS256 token", async () => {
        const token = sign({ sub: "1", role: "admin", exp: Math.floor(Date.now() / 1000) + 60 }, "secret");
        await expect(verifyJwtToken(token, "secret")).resolves.toMatchObject({ sub: "1", role: "admin" });
        await expect(verifyJwtToken(token, "wrong-secret")).resolves.toBeNull();
    });

    it("fails closed when the verification secret is missing", async () => {
        await expect(verifyJwtToken("header.payload.signature", "")).resolves.toBeNull();
    });
});

import { expect, test } from "vitest";
import { transformRegisterUrl } from "./use-url-generator";

test("transformRegisterUrl은 key query를 현재 origin 기반 경로로 바꾼다", () => {
    expect(
        transformRegisterUrl("https://api.example.com/club-register?key=abc123", "http://127.0.0.1:4001"),
        "http://127.0.0.1:4001/club-register/abc123"
    ).toBe("http://127.0.0.1:4001/club-register/abc123");
});

test("transformRegisterUrl은 key가 없으면 원본 URL을 유지한다", () => {
    expect(
        transformRegisterUrl("https://api.example.com/club-register", "http://127.0.0.1:4001"),
        "https://api.example.com/club-register"
    ).toBe("https://api.example.com/club-register");
});

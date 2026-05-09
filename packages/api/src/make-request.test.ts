import { describe, expect, test } from "vitest";
import { shouldAttemptTokenRefresh } from "./make-request";

describe("shouldAttemptTokenRefresh", () => {
    test("401 응답이면 일반 API 요청은 토큰 갱신 대상이다", () => {
        expect(shouldAttemptTokenRefresh({ status: 401, hasRetried: false })).toBe(true);
    });

    test("skipAuthRefresh 옵션이 있으면 401이어도 토큰 갱신 대상에서 제외한다", () => {
        expect(shouldAttemptTokenRefresh({ status: 401, skipAuthRefresh: true, hasRetried: false })).toBe(false);
    });

    test("이미 토큰 갱신 후 재시도한 요청은 다시 갱신하지 않는다", () => {
        expect(shouldAttemptTokenRefresh({ status: 401, hasRetried: true })).toBe(false);
    });

    test("401이 아닌 응답은 토큰 갱신 대상이 아니다", () => {
        expect(shouldAttemptTokenRefresh({ status: 403, hasRetried: false })).toBe(false);
    });
});

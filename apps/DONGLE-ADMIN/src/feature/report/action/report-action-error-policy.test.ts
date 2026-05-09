import { describe, expect, test } from "vitest";
import { buildReportActionError, isUnauthorizedError } from "./report-action-error-policy";

describe("buildReportActionError", () => {
    test("auth 분기는 세션 만료를 반환한다", () => {
        expect(buildReportActionError({ branch: "auth", actionLabel: "create" })).toEqual({
            errorType: "form",
            error: "로그인 시간이 만료되었습니다. 다시 로그인해주세요.",
            retryable: false,
            sessionExpired: true,
        });
    });

    test("upload 분기는 재시도 힌트를 반환한다", () => {
        expect(buildReportActionError({ branch: "upload", actionLabel: "update" })).toEqual({
            errorType: "form",
            error: "이미지 업로드에 실패했습니다. 다시 시도해주세요.",
            retryable: true,
            retryHint: "네트워크 상태를 확인한 뒤 다시 시도해주세요.",
        });
    });

    test("service 분기는 action label에 맞는 메시지를 반환한다", () => {
        expect(buildReportActionError({ branch: "service", actionLabel: "create" }).error).toContain("생성");
        expect(buildReportActionError({ branch: "service", actionLabel: "update" }).error).toContain("수정");
    });
});

describe("isUnauthorizedError", () => {
    test("Unauthorized 에러만 true", () => {
        expect(isUnauthorizedError(new Error("Unauthorized"))).toBe(true);
        expect(isUnauthorizedError(new Error("Other"))).toBe(false);
        expect(isUnauthorizedError("Unauthorized")).toBe(false);
    });
});

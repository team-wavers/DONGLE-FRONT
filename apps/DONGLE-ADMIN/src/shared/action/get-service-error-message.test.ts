import { afterEach, describe, expect, test, vi } from "vitest";
import { getServiceErrorMessage } from "./get-service-error-message";

describe("getServiceErrorMessage", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test("message가 있으면 message를 우선 사용한다", () => {
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

        expect(getServiceErrorMessage({ message: "요약 메시지", detail: "상세 메시지" }, "기본 메시지")).toBe(
            "요약 메시지"
        );
        expect(consoleError).toHaveBeenCalledWith("상세 메시지");
    });

    test("message가 없고 detail만 있으면 detail을 사용한다", () => {
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

        expect(getServiceErrorMessage({ detail: "상세 메시지" }, "기본 메시지")).toBe("상세 메시지");
        expect(consoleError).toHaveBeenCalledWith("상세 메시지");
    });

    test("message와 detail이 모두 없으면 fallback을 사용한다", () => {
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

        expect(getServiceErrorMessage({}, "기본 메시지")).toBe("기본 메시지");
        expect(getServiceErrorMessage(undefined, "기본 메시지")).toBe("기본 메시지");
        expect(getServiceErrorMessage(null, "기본 메시지")).toBe("기본 메시지");
        expect(consoleError).not.toHaveBeenCalled();
    });

    test("빈 문자열 message는 무시하고 detail 또는 fallback을 사용한다", () => {
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

        expect(getServiceErrorMessage({ message: "", detail: "상세 메시지" }, "기본 메시지")).toBe("상세 메시지");
        expect(getServiceErrorMessage({ message: "", detail: "" }, "기본 메시지")).toBe("기본 메시지");
        expect(consoleError).toHaveBeenCalledTimes(1);
        expect(consoleError).toHaveBeenCalledWith("상세 메시지");
    });
});

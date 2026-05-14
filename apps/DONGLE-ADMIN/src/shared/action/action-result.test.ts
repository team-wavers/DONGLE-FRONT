import { describe, expect, test } from "vitest";
import { actionFailure, actionSuccess } from "./action-result";

describe("action-result", () => {
    test("성공 결과를 공통 형태로 만든다", () => {
        expect(actionSuccess({ data: { id: 1 }, message: "완료" })).toEqual({
            ok: true,
            data: { id: 1 },
            message: "완료",
        });
    });

    test("실패 결과를 공통 형태로 만든다", () => {
        expect(actionFailure({ fieldErrors: { name: "이름을 입력해주세요" }, formError: "확인해주세요", retryable: true })).toEqual({
            ok: false,
            fieldErrors: { name: "이름을 입력해주세요" },
            formError: "확인해주세요",
            retryable: true,
        });
    });
});

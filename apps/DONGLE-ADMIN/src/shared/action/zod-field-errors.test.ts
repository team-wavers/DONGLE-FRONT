import { describe, expect, test } from "vitest";
import { getZodFieldErrors } from "./zod-field-errors";

describe("getZodFieldErrors", () => {
    test("zod issue 목록을 첫 field error map으로 변환한다", () => {
        const fieldErrors = getZodFieldErrors<"name" | "phone">({
            issues: [
                { path: ["name"], message: "이름을 입력해주세요" },
                { path: ["name"], message: "중복 에러는 무시됩니다" },
                { path: ["phone"], message: "전화번호를 확인해주세요" },
            ],
        });

        expect(fieldErrors).toEqual({
            name: "이름을 입력해주세요",
            phone: "전화번호를 확인해주세요",
        });
    });

    test("field path가 없는 issue는 무시한다", () => {
        expect(getZodFieldErrors({ issues: [{ path: [], message: "폼 오류" }] })).toEqual({});
    });
});

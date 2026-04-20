import { expect, test } from "vitest";
import { validateActivityReportInput } from "./activity-report.validation";

test("validateActivityReportInput은 빈 제목과 내용을 거부한다", () => {
    const result = validateActivityReportInput({
        title: "",
        content: "",
    });

    expect(result.isValid).toBe(false);
    expect(result.fieldErrors.title).toBe("제목을 입력해주세요");
    expect(result.fieldErrors.content).toBe("내용을 입력해주세요");
});

test("validateActivityReportInput은 제목 길이와 내용 최소 길이를 검증한다", () => {
    const result = validateActivityReportInput({
        title: "가",
        content: "짧은내용",
    });

    expect(result.isValid).toBe(false);
    expect(result.fieldErrors.title).toBe("제목은 최소 2자 이상이어야 합니다");
    expect(result.fieldErrors.content).toBe("내용은 최소 10자 이상이어야 합니다");
});

test("validateActivityReportInput은 유효한 입력을 통과시킨다", () => {
    const result = validateActivityReportInput({
        title: "정기 스터디 활동보고서",
        content: "이번 주에는 정기 스터디와 코드 리뷰를 진행했습니다.",
    });

    expect(result.isValid).toBe(true);
    expect(result.fieldErrors).toEqual({});
});

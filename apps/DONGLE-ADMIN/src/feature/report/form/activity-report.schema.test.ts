import { describe, expect, test } from "vitest";
import { activityReportSchema, buildActivityReportUpdatePayload } from "./activity-report.schema";

describe("activityReportSchema", () => {
    test("제목과 내용을 기존 검증 정책으로 검증한다", () => {
        const result = activityReportSchema.safeParse({
            title: "",
            content: "짧음",
            imageUrls: [],
            imageFile: null,
        });

        expect(result.success).toBe(false);
        expect(result.error?.issues.map((issue) => issue.path.join("."))).toEqual(
            expect.arrayContaining(["title", "content"])
        );
    });

    test("유효한 제목과 내용을 trim 정규화한다", () => {
        const result = activityReportSchema.safeParse({
            title: "  정기 활동보고서  ",
            content: "  열 글자보다 긴 활동 내용입니다.  ",
            imageUrls: [],
            imageFile: null,
        });

        expect(result.success).toBe(true);
        expect(result.data).toMatchObject({
            title: "정기 활동보고서",
            content: "열 글자보다 긴 활동 내용입니다.",
        });
    });
});

describe("buildActivityReportUpdatePayload", () => {
    test("기존 이미지 유지와 새 업로드 이미지를 합쳐 변경 payload를 만든다", () => {
        expect(
            buildActivityReportUpdatePayload({
                values: {
                    title: "수정 제목",
                    content: "<p>기존 내용입니다.</p>",
                    imageUrls: ["https://cdn.test/old.png"],
                    imageFile: null,
                },
                originalReport: {
                    title: "기존 제목",
                    content: "<p>기존 내용입니다.</p>",
                    image_urls: ["https://cdn.test/old.png"],
                },
                uploadedImageUrls: ["https://cdn.test/new.png"],
            })
        ).toEqual({
            title: "수정 제목",
            image_urls: ["https://cdn.test/old.png", "https://cdn.test/new.png"],
        });
    });
});

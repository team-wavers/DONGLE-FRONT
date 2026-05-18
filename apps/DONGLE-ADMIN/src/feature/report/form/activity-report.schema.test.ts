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

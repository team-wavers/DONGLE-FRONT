import { expect, test } from "vitest";
import {
    buildReportUpdatePayload,
    mergeReportImageUrls,
    parseJsonStringArray,
} from "./report-update-payload";

test("parseJsonStringArray는 JSON 배열 문자열만 안전하게 파싱한다", () => {
    expect(parseJsonStringArray('["a","b"]')).toEqual(["a", "b"]);
    expect(parseJsonStringArray("")).toEqual([]);
    expect(parseJsonStringArray(undefined)).toEqual([]);
});

test("mergeReportImageUrls는 삭제되지 않은 기존 이미지와 새 업로드 이미지를 합친다", () => {
    expect(mergeReportImageUrls(["/a.png", "/b.png"], ["/a.png"], ["/c.png"])).toEqual(["/b.png", "/c.png"]);
});

test("buildReportUpdatePayload는 변경된 필드만 포함한다", () => {
    expect(
        buildReportUpdatePayload({
            title: "수정된 제목",
            content: "<p>same</p>",
            imageUrls: ["/a.png", "/c.png"],
            originalTitle: "기존 제목",
            originalContent: "<p>same</p>",
            originalImageUrls: ["/a.png", "/b.png"],
        })
    ).toEqual({
            title: "수정된 제목",
            image_urls: ["/a.png", "/c.png"],
    });
});

test("buildReportUpdatePayload는 이미지 순서만 바뀐 경우 변경으로 보지 않는다", () => {
    expect(
        buildReportUpdatePayload({
            title: "제목",
            content: "<p>내용</p>",
            imageUrls: ["/b.png", "/a.png"],
            originalTitle: "제목",
            originalContent: "<p>내용</p>",
            originalImageUrls: ["/a.png", "/b.png"],
        })
    ).toEqual({});
});

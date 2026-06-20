import { describe, expect, test } from "vitest";
import { getNextReplaceExistingUrlsSnapshot, getReplaceCancelRestoredUrls } from "./rhf-file-upload";

describe("getReplaceCancelRestoredUrls", () => {
    test("replace 모드에서 새 파일 선택을 취소하면 지워둔 기존 URL을 복구한다", () => {
        expect(
            getReplaceCancelRestoredUrls({
                selectionMode: "replace",
                nextFileCount: 0,
                currentExistingUrls: [],
                replacedExistingUrls: ["https://cdn.test/old.png"],
            })
        ).toEqual(["https://cdn.test/old.png"]);
    });

    test("새 파일이 남아 있거나 기존 URL이 이미 있으면 복구하지 않는다", () => {
        expect(
            getReplaceCancelRestoredUrls({
                selectionMode: "replace",
                nextFileCount: 1,
                currentExistingUrls: [],
                replacedExistingUrls: ["https://cdn.test/old.png"],
            })
        ).toBeNull();
        expect(
            getReplaceCancelRestoredUrls({
                selectionMode: "replace",
                nextFileCount: 0,
                currentExistingUrls: ["https://cdn.test/current.png"],
                replacedExistingUrls: ["https://cdn.test/old.png"],
            })
        ).toBeNull();
    });
});

describe("getNextReplaceExistingUrlsSnapshot", () => {
    test("기존 URL을 이미 보관한 뒤 다시 파일을 골라도 빈 값으로 덮어쓰지 않는다", () => {
        expect(
            getNextReplaceExistingUrlsSnapshot({
                currentExistingUrls: [],
                replacedExistingUrls: ["https://cdn.test/old.png"],
            })
        ).toEqual(["https://cdn.test/old.png"]);
    });

    test("현재 기존 URL이 있으면 replace 취소 복구용 스냅샷으로 보관한다", () => {
        expect(
            getNextReplaceExistingUrlsSnapshot({
                currentExistingUrls: ["https://cdn.test/current.png"],
                replacedExistingUrls: null,
            })
        ).toEqual(["https://cdn.test/current.png"]);
    });
});

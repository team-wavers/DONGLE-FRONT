import { expect, test } from "vitest";
import { shouldClearSessionStorageDraft } from "./use-session-storage-draft";

test("shouldClearSessionStorageDraft는 dirty하지 않으면 clear한다", () => {
    expect(
        shouldClearSessionStorageDraft({
            isDirty: false,
            success: false,
            previousSuccess: false,
        })
    ).toBe(true);
});

test("shouldClearSessionStorageDraft는 성공으로 막 전이된 시점에만 clear한다", () => {
    expect(
        shouldClearSessionStorageDraft({
            isDirty: true,
            success: true,
            previousSuccess: false,
        })
    ).toBe(true);

    expect(
        shouldClearSessionStorageDraft({
            isDirty: true,
            success: true,
            previousSuccess: true,
        })
    ).toBe(false);
});

test("shouldClearSessionStorageDraft는 성공 이후 다시 수정 중이면 저장을 유지한다", () => {
    expect(
        shouldClearSessionStorageDraft({
            isDirty: true,
            success: false,
            previousSuccess: true,
        })
    ).toBe(false);
});

import { afterEach, beforeEach, expect, test, vi } from "vitest";

const hookState = vi.hoisted(() => ({
    refCursor: 0,
    refs: [] as Array<{ current: unknown }>,
}));

vi.mock("react", () => ({
    useCallback: <T>(callback: T) => callback,
    useEffect: (effect: () => void | (() => void)) => {
        effect();
    },
    useRef: <T>(initialValue: T) => {
        const index = hookState.refCursor;
        hookState.refCursor += 1;
        hookState.refs[index] ??= { current: initialValue };

        return hookState.refs[index] as { current: T };
    },
    useState: <T>(initialValue: T) => [initialValue, vi.fn()] as const,
}));

import { useDebouncedComposingValue } from "./use-debounced-composing-value";

function renderHook(initialValue: string, onCommit: (value: string) => void) {
    hookState.refCursor = 0;

    return useDebouncedComposingValue(initialValue, onCommit);
}

beforeEach(() => {
    vi.useFakeTimers();
    hookState.refCursor = 0;
    hookState.refs = [];
});

afterEach(() => {
    vi.useRealTimers();
});

test("외부 값으로 동기화하면 이전 입력의 pending commit을 취소한다", () => {
    const onCommit = vi.fn();
    const { onChange } = renderHook("", onCommit);

    onChange("이전 검색어");
    renderHook("새 URL 검색어", onCommit);
    vi.advanceTimersByTime(300);

    expect(onCommit).not.toHaveBeenCalled();
});

test("IME 조합 중 외부 값이 바뀌면 해당 조합 종료 시 이전 입력을 commit하지 않는다", () => {
    const onCommit = vi.fn();
    const { onChange, onCompositionStart, onCompositionEnd } = renderHook("", onCommit);

    onCompositionStart();
    onChange("이전 검색어");
    renderHook("새 URL 검색어", onCommit);
    onCompositionEnd("이전 검색어");
    vi.advanceTimersByTime(300);

    expect(onCommit).not.toHaveBeenCalled();
});

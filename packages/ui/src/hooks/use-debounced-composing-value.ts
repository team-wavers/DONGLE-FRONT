import { useCallback, useEffect, useRef, useState } from "react";

interface UseDebouncedComposingValueResult {
    value: string;
    onChange: (nextValue: string) => void;
    onCompositionStart: () => void;
    onCompositionEnd: (nextValue: string) => void;
}

// 입력 표시(value)는 항상 즉시 갱신되고, onCommit은 composing 여부와 무관하게 매 입력마다
// debounce를 건다. 한글(2벌식) 조합은 마지막 음절에서 compositionend가 영영 발생하지 않을 수 있어
// (다음 입력이 와야 음절 경계가 확정되므로) compositionend에만 커밋을 의존하면 마지막 글자가 영영
// 반영되지 않는 경우가 생긴다. debounce 자체가 빠른 연속 입력 중 중간 상태 커밋을 막아주므로
// composing 중 커밋을 별도로 막을 필요는 없다.
export function useDebouncedComposingValue(
    initialValue: string,
    onCommit: (value: string) => void,
    debounceMs = 300
): UseDebouncedComposingValueResult {
    const [value, setValue] = useState(initialValue);
    const isComposingRef = useRef(false);
    const lastCommittedRef = useRef(initialValue);
    const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const pendingExternalValueRef = useRef<string | undefined>(undefined);

    useEffect(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = undefined;
        }

        if (isComposingRef.current) {
            pendingExternalValueRef.current = initialValue;
            lastCommittedRef.current = initialValue;
            return;
        }

        // 외부에서 initialValue가 바뀐 경우(뒤로가기 등)에만 동기화한다.
        // 자기 자신이 막 커밋한 값과 같으면(echo) 무시해서 무한 루프를 막는다.
        if (initialValue === lastCommittedRef.current) {
            return;
        }

        lastCommittedRef.current = initialValue;
        setValue(initialValue);
    }, [initialValue]);

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    const commit = useCallback(
        (nextValue: string) => {
            lastCommittedRef.current = nextValue;
            onCommit(nextValue);
        },
        [onCommit]
    );

    const scheduleCommit = useCallback(
        (nextValue: string) => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            timerRef.current = setTimeout(() => commit(nextValue), debounceMs);
        },
        [commit, debounceMs]
    );

    const onChange = useCallback(
        (nextValue: string) => {
            setValue(nextValue);
            scheduleCommit(nextValue);
        },
        [scheduleCommit]
    );

    const onCompositionStart = useCallback(() => {
        isComposingRef.current = true;
        pendingExternalValueRef.current = undefined;
    }, []);

    const onCompositionEnd = useCallback(
        (nextValue: string) => {
            isComposingRef.current = false;

            if (pendingExternalValueRef.current !== undefined) {
                setValue(pendingExternalValueRef.current);
                pendingExternalValueRef.current = undefined;
                return;
            }

            setValue(nextValue);
            scheduleCommit(nextValue);
        },
        [scheduleCommit]
    );

    return { value, onChange, onCompositionStart, onCompositionEnd };
}

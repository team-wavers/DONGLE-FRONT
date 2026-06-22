"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedComposingValue } from "@dongle/ui/hooks/use-debounced-composing-value";

interface UseUrlKeywordSearchOptions {
    paramKey?: string;
    debounceMs?: number;
}

// 단일 검색어("q") 파라미터를 URL과 동기화한다. 입력은 즉시 반영되고,
// IME 조합이 끝나거나 일반 입력일 때 debounce 후 URL이 갱신된다.
export function useUrlKeywordSearch({ paramKey = "q", debounceMs = 300 }: UseUrlKeywordSearchOptions = {}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const keyword = searchParams.get(paramKey)?.trim() ?? "";

    const commit = useCallback(
        (nextValue: string) => {
            const nextSearchParams = new URLSearchParams(searchParams.toString());
            const trimmed = nextValue.trim();

            if (trimmed) {
                nextSearchParams.set(paramKey, trimmed);
            } else {
                nextSearchParams.delete(paramKey);
            }

            const queryString = nextSearchParams.toString();
            router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
        },
        [paramKey, pathname, router, searchParams]
    );

    const { value, onChange, onCompositionStart, onCompositionEnd } = useDebouncedComposingValue(
        keyword,
        commit,
        debounceMs
    );

    return { keyword, inputValue: value, onChange, onCompositionStart, onCompositionEnd };
}

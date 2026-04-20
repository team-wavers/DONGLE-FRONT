"use client";

import { useEffect, useRef, useState } from "react";

interface UseSessionStorageDraftOptions<T> {
    key: string;
    currentValue: T;
    baselineValue: T;
    isDirty: boolean;
    success?: boolean;
    restoreMessage?: string;
    shouldRestore?: (value: T, initialValue: T) => boolean;
    serialize?: (value: T) => string;
    deserialize?: (raw: string) => T;
    onRestore?: (value: T) => void;
    onClear?: () => void;
    onRestoreStateChange?: (restored: boolean) => void;
}

export function useSessionStorageDraft<T>({
    key,
    currentValue,
    baselineValue,
    isDirty,
    success = false,
    restoreMessage,
    shouldRestore,
    serialize = JSON.stringify,
    deserialize = JSON.parse as (raw: string) => T,
    onRestore,
    onClear,
    onRestoreStateChange,
}: UseSessionStorageDraftOptions<T>) {
    const [didRestoreDraft, setDidRestoreDraft] = useState(false);
    const didRunRestoreRef = useRef(false);
    const previousKeyRef = useRef(key);
    const shouldRestoreRef = useRef(shouldRestore);
    const deserializeRef = useRef(deserialize);
    const serializeRef = useRef(serialize);
    const onRestoreRef = useRef(onRestore);
    const onClearRef = useRef(onClear);
    const onRestoreStateChangeRef = useRef(onRestoreStateChange);

    useEffect(() => {
        shouldRestoreRef.current = shouldRestore;
        deserializeRef.current = deserialize;
        serializeRef.current = serialize;
        onRestoreRef.current = onRestore;
        onClearRef.current = onClear;
        onRestoreStateChangeRef.current = onRestoreStateChange;
    }, [deserialize, onClear, onRestore, onRestoreStateChange, serialize, shouldRestore]);

    useEffect(() => {
        if (previousKeyRef.current === key) {
            return;
        }

        previousKeyRef.current = key;
        didRunRestoreRef.current = false;
        setDidRestoreDraft(false);
        onRestoreStateChangeRef.current?.(false);
    }, [key]);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        if (didRunRestoreRef.current) {
            return;
        }

        didRunRestoreRef.current = true;

        const savedDraft = window.sessionStorage.getItem(key);
        if (!savedDraft) {
            return;
        }

        try {
            const parsedDraft = deserializeRef.current(savedDraft);
            const canRestore = shouldRestoreRef.current ? shouldRestoreRef.current(parsedDraft, baselineValue) : true;

            if (!canRestore) {
                window.sessionStorage.removeItem(key);
                onClearRef.current?.();
                return;
            }

            onRestoreRef.current?.(parsedDraft);
            setDidRestoreDraft(true);
            onRestoreStateChangeRef.current?.(true);
        } catch {
            window.sessionStorage.removeItem(key);
            onClearRef.current?.();
        }
    }, [baselineValue, key, restoreMessage]);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        if (success || !isDirty) {
            window.sessionStorage.removeItem(key);
            onClearRef.current?.();
            return;
        }

        const timeoutId = window.setTimeout(() => {
            window.sessionStorage.setItem(key, serializeRef.current(currentValue));
        }, 400);

        return () => window.clearTimeout(timeoutId);
    }, [currentValue, isDirty, key, success]);

    const saveNow = (value: T) => {
        if (typeof window === "undefined") {
            return;
        }

        window.sessionStorage.setItem(key, serializeRef.current(value));
    };

    const clear = () => {
        if (typeof window === "undefined") {
            return;
        }

        window.sessionStorage.removeItem(key);
        onClearRef.current?.();
    };

    return {
        didRestoreDraft,
        saveNow,
        clear,
    };
}

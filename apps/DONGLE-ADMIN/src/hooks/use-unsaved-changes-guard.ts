"use client";

import { useEffect } from "react";

interface UseUnsavedChangesGuardOptions {
    isDirty: boolean;
    message: string;
}

export function useUnsavedChangesGuard({ isDirty, message }: UseUnsavedChangesGuardOptions) {
    useEffect(() => {
        if (typeof window === "undefined" || !isDirty) {
            return;
        }

        const confirmNavigation = () => window.confirm(message);

        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = message;
        };

        const handleDocumentClick = (event: MouseEvent) => {
            const target = event.target;
            if (!(target instanceof Element)) {
                return;
            }

            const anchor = target.closest("a[href]") as HTMLAnchorElement | null;
            if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) {
                return;
            }

            const href = anchor.getAttribute("href");
            if (!href || href.startsWith("#")) {
                return;
            }

            const nextUrl = new URL(anchor.href, window.location.href);
            const currentUrl = new URL(window.location.href);
            const isSameDestination =
                nextUrl.pathname === currentUrl.pathname &&
                nextUrl.search === currentUrl.search &&
                nextUrl.hash === currentUrl.hash;

            if (isSameDestination) {
                return;
            }

            if (!confirmNavigation()) {
                event.preventDefault();
                event.stopPropagation();
            }
        };

        window.__dongleUnsavedChangesPrompt = confirmNavigation;
        window.addEventListener("beforeunload", handleBeforeUnload);
        document.addEventListener("click", handleDocumentClick, true);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
            document.removeEventListener("click", handleDocumentClick, true);

            if (window.__dongleUnsavedChangesPrompt === confirmNavigation) {
                delete window.__dongleUnsavedChangesPrompt;
            }
        };
    }, [isDirty, message]);
}

declare global {
    interface Window {
        __dongleUnsavedChangesPrompt?: () => boolean;
    }
}

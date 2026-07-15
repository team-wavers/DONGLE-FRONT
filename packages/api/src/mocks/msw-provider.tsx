"use client";

import { useEffect, type ReactNode } from "react";
import { isMswEnabled } from "./is-msw-enabled";

export function MswProvider({ children }: { children: ReactNode }) {
    useEffect(() => {
        if (!isMswEnabled()) {
            return;
        }

        let cancelled = false;

        void import("./browser").then(({ worker }) => {
            if (cancelled) {
                return;
            }

            return worker.start({ onUnhandledRequest: "bypass", quiet: true });
        });

        return () => {
            cancelled = true;
        };
    }, []);

    return children;
}

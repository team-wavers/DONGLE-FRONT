"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface UseSessionExpiredRedirectOptions<T> {
    sessionExpired?: boolean;
    returnTo: string;
    drafts: Array<{
        isDirty: boolean;
        save: () => void;
    }>;
}

export function useSessionExpiredRedirect<T>({
    sessionExpired,
    returnTo,
    drafts,
}: UseSessionExpiredRedirectOptions<T>) {
    const router = useRouter();

    useEffect(() => {
        if (!sessionExpired) {
            return;
        }

        drafts.forEach((draft) => {
            if (draft.isDirty) {
                draft.save();
            }
        });

        const searchParams = new URLSearchParams({
            expired: "true",
            returnTo,
        });

        router.replace(`/login?${searchParams.toString()}`);
    }, [drafts, returnTo, router, sessionExpired]);
}

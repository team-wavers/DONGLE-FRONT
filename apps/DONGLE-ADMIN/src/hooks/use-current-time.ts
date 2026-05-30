"use client";

import { useEffect, useState } from "react";

export function useCurrentTime(intervalMs = 60_000) {
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const intervalId = window.setInterval(() => {
            setNow(new Date());
        }, intervalMs);

        return () => window.clearInterval(intervalId);
    }, [intervalMs]);

    return now;
}

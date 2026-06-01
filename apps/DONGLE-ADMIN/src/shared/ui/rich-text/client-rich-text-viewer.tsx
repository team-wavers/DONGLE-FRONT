"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { RichTextViewerProps } from "@dongle/rich-text";

function loadRichTextViewer() {
    return import("@dongle/rich-text").then((module) => module.RichTextViewer);
}

const DynamicRichTextViewer = dynamic<RichTextViewerProps>(
    loadRichTextViewer,
    {
        ssr: false,
    }
);

export default function ClientRichTextViewer(props: RichTextViewerProps) {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        let isMounted = true;

        void loadRichTextViewer().then(() => {
            if (isMounted) {
                setIsReady(true);
            }
        });

        return () => {
            isMounted = false;
        };
    }, []);

    if (!isReady) {
        return props.fallback ?? null;
    }

    return <DynamicRichTextViewer {...props} />;
}

"use client";

import type { ReactNode } from "react";
import React from "react";
import { useEffect, useState } from "react";
import { richTextContentClassName } from "./rich-text-content";
import { sanitizeRichTextForViewer } from "./sanitize-rich-text-for-viewer";

export interface RichTextViewerProps {
    html: string;
    className?: string;
    fallback?: ReactNode;
}

export function RichTextViewer({ html, className, fallback }: RichTextViewerProps) {
    const [safeHtml, setSafeHtml] = useState("");
    const [isPending, setIsPending] = useState(Boolean(html));

    useEffect(() => {
        let isMounted = true;
        setIsPending(Boolean(html));

        async function sanitizeHtml() {
            const sanitizedHtml = await sanitizeRichTextForViewer(html);

            if (isMounted) {
                setSafeHtml(sanitizedHtml);
                setIsPending(false);
            }
        }

        void sanitizeHtml();

        return () => {
            isMounted = false;
        };
    }, [html]);

    return (
        <div className={className ? `${richTextContentClassName} ${className}` : richTextContentClassName}>
            {isPending && fallback ? (
                fallback
            ) : (
                <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: safeHtml }} />
            )}
        </div>
    );
}

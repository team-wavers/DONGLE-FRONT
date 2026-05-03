"use client";

import { useEffect, useState } from "react";
import { generateHTML, generateJSON } from "@tiptap/core";
import { createRichTextExtensions, richTextContentClassName } from "./rich-text-content";
import { normalizeRichTextHtml } from "./sanitize-rich-text-html";

interface RichTextViewerProps {
    html: string;
    className?: string;
}

export function RichTextViewer({ html, className }: RichTextViewerProps) {
    const [safeHtml, setSafeHtml] = useState("");

    useEffect(() => {
        let isMounted = true;

        async function sanitizeHtml() {
            const DOMPurify = (await import("isomorphic-dompurify")).default;
            const normalizedHtml = normalizeRichTextHtml(html);
            const sanitizedInputHtml = DOMPurify.sanitize(normalizedHtml, {
                USE_PROFILES: { html: true },
            });
            let renderedHtml = sanitizedInputHtml;

            try {
                const extensions = createRichTextExtensions();
                const jsonContent = generateJSON(sanitizedInputHtml, extensions);
                renderedHtml = generateHTML(jsonContent, extensions);
            } catch {
                renderedHtml = sanitizedInputHtml;
            }

            const sanitizedHtml = DOMPurify.sanitize(renderedHtml, {
                USE_PROFILES: { html: true },
            });

            if (isMounted) {
                setSafeHtml(sanitizedHtml);
            }
        }

        void sanitizeHtml();

        return () => {
            isMounted = false;
        };
    }, [html]);

    return (
        <div
            className={className ? `${richTextContentClassName} ${className}` : richTextContentClassName}
            suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: safeHtml }}
        />
    );
}

"use client";

import type { ReactNode } from "react";
import React from "react";
import { useEffect, useState } from "react";
import { generateHTML, generateJSON } from "@tiptap/core";
import { createRichTextExtensions, richTextContentClassName } from "./rich-text-content";
import { normalizeRichTextHtml } from "./sanitize-rich-text-html";

interface DomPurifyLike {
    sanitize: (html: string, options: { USE_PROFILES: { html: boolean } }) => string;
}

export interface RichTextViewerProps {
    html: string;
    className?: string;
    fallback?: ReactNode;
}

async function loadDomPurify(): Promise<DomPurifyLike> {
    return (await import("isomorphic-dompurify")).default;
}

export async function sanitizeRichTextForViewer(
    html: string,
    loadSanitizer: () => Promise<DomPurifyLike> = loadDomPurify
) {
    try {
        const DOMPurify = await loadSanitizer();
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

        return DOMPurify.sanitize(renderedHtml, {
            USE_PROFILES: { html: true },
        });
    } catch {
        return "";
    }
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

"use client";

import dynamic from "next/dynamic";
import type { RichTextViewerProps } from "@dongle/rich-text";

const ClientRichTextViewer = dynamic<RichTextViewerProps>(
    () => import("@dongle/rich-text").then((module) => module.RichTextViewer),
    {
        ssr: false,
    }
);

export default ClientRichTextViewer;

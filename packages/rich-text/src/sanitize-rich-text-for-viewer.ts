import { generateHTML, generateJSON } from "@tiptap/core";
import { createRichTextExtensions } from "./rich-text-content";
import { normalizeRichTextHtml } from "./sanitize-rich-text-html";

interface DomPurifyLike {
    sanitize: (html: string, options: { USE_PROFILES: { html: boolean } }) => string;
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

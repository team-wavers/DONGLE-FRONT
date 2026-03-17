const htmlTagPattern = /<\/?[a-z][\s\S]*>/i;

function escapeHtml(value: string) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

export function normalizeRichTextHtml(value: string) {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
        return "";
    }

    if (htmlTagPattern.test(trimmedValue)) {
        return trimmedValue;
    }

    return escapeHtml(trimmedValue).replaceAll("\n", "<br />");
}

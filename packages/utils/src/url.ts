export function normalizeExternalUrl(value?: string | null) {
    const trimmedValue = value?.trim();

    if (!trimmedValue) {
        return null;
    }

    const hasExplicitProtocol = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(trimmedValue);
    const hasUnsupportedSchemeLikeValue =
        !hasExplicitProtocol &&
        /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmedValue) &&
        !/^[^/:?#]+:\d+(?:[/?#]|$)/.test(trimmedValue);
    const isProtocolRelative = trimmedValue.startsWith("//");
    const isRelativePath = trimmedValue.startsWith("/") && !isProtocolRelative;
    const hostCandidate = trimmedValue.split(/[/?#]/, 1)[0] ?? "";
    const hasExternalHost = hostCandidate.includes(".") || /^\[[^\]]+\](?::\d+)?$/.test(hostCandidate);

    if (hasUnsupportedSchemeLikeValue || isRelativePath || (!hasExplicitProtocol && !isProtocolRelative && !hasExternalHost)) {
        return null;
    }

    const urlValue = hasExplicitProtocol ? trimmedValue : isProtocolRelative ? `https:${trimmedValue}` : `https://${trimmedValue}`;

    try {
        const url = new URL(urlValue);
        const protocol = url.protocol.toLowerCase();

        if (protocol !== "http:" && protocol !== "https:") {
            return null;
        }

        if (url.username || url.password) {
            return null;
        }

        return url.toString();
    } catch {
        return null;
    }
}

export function normalizeInternalReturnTo(returnTo: string | null) {
    if (!returnTo || !returnTo.startsWith("/") || returnTo.startsWith("//")) {
        return null;
    }

    try {
        const url = new URL(returnTo, "http://localhost");
        return `${url.pathname}${url.search}${url.hash}`;
    } catch {
        return null;
    }
}

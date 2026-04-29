export function decodeReturnToInput(returnTo: string): string {
    try {
        return decodeURIComponent(returnTo);
    } catch {
        return returnTo;
    }
}

export function isAllowedInternalReturnPath(path: string): boolean {
    return path.startsWith("/") && !path.startsWith("//");
}

export function normalizeInternalReturnTo(returnTo: string | null) {
    if (!returnTo) {
        return null;
    }

    const decodedReturnTo = decodeReturnToInput(returnTo.trim());

    if (!isAllowedInternalReturnPath(decodedReturnTo)) {
        return null;
    }

    try {
        const url = new URL(decodedReturnTo, "http://localhost");
        return `${url.pathname}${url.search}${url.hash}`;
    } catch {
        return null;
    }
}

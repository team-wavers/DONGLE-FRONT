const SENTRY_DISABLED_VALUES = new Set(["1", "true", "yes", "on"]);

export function isSentryDisabledByEnv() {
    const rawValue = process.env.SENTRY_DISABLED ?? process.env.NEXT_PUBLIC_SENTRY_DISABLED;

    if (!rawValue) {
        return false;
    }

    return SENTRY_DISABLED_VALUES.has(rawValue.trim().toLowerCase());
}

export function isLocalBrowserRuntime() {
    return (
        typeof window !== "undefined" &&
        ["localhost", "127.0.0.1"].includes(window.location.hostname)
    );
}

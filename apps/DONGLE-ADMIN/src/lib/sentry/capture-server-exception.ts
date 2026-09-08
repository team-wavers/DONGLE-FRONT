import * as Sentry from "@sentry/nextjs";

const SENSITIVE_EXTRA_KEYS = new Set([
    "login_id",
    "password",
    "registrationKey",
    "token",
    "accessToken",
    "refreshToken",
]);

function sanitizeExtra(extra?: Record<string, unknown>) {
    if (!extra) {
        return extra;
    }

    return Object.fromEntries(
        Object.entries(extra).filter(([key]) => !SENSITIVE_EXTRA_KEYS.has(key))
    );
}

export function captureServerException(error: unknown, message: string, extra?: Record<string, unknown>) {
    console.error(message, error);

    const safeExtra = sanitizeExtra(extra);

    if (error instanceof Error) {
        Sentry.captureException(error, {
            tags: {
                app: "dongle-admin",
                runtime: "server",
            },
            extra: {
                message,
                ...safeExtra,
            },
        });
        return;
    }

    Sentry.captureMessage(message, {
        level: "error",
        tags: {
            app: "dongle-admin",
            runtime: "server",
        },
        extra: {
            error,
            ...safeExtra,
        },
    });
}

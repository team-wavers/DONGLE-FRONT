import * as Sentry from "@sentry/nextjs";

export function captureServerException(error: unknown, message: string, extra?: Record<string, unknown>) {
    console.error(message, error);

    if (error instanceof Error) {
        Sentry.captureException(error, {
            tags: {
                app: "dongle-admin",
                runtime: "server",
            },
            extra: {
                message,
                ...extra,
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
            ...extra,
        },
    });
}

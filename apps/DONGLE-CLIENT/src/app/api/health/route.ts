import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    const apiConfigured = Boolean(process.env.API_URL) && Boolean(process.env.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY);

    return NextResponse.json(
        {
            ok: apiConfigured,
            app: "dongle-client",
            environment: process.env.NODE_ENV ?? "unknown",
            release: process.env.SENTRY_RELEASE ?? "unknown",
            apiConfigured,
        },
        { headers: { "Cache-Control": "no-store" } },
    );
}

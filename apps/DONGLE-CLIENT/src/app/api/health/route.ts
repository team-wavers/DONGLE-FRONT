import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    return NextResponse.json({
        ok: true,
        app: "dongle-client",
        environment: process.env.NODE_ENV ?? "unknown",
        release: process.env.SENTRY_RELEASE ?? "unknown",
    });
}

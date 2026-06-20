import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

function isStringArray(value: unknown): value is string[] {
    return Array.isArray(value) && value.every((item) => typeof item === "string");
}

export async function POST(request: NextRequest) {
    const secret = request.headers.get("x-revalidate-secret");

    if (!secret || secret !== process.env.REVALIDATE_SECRET) {
        return NextResponse.json({ message: "unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ message: "invalid body" }, { status: 400 });
    }

    const tags = (body as { tags?: unknown } | null)?.tags;
    if (!isStringArray(tags)) {
        return NextResponse.json({ message: "invalid tags" }, { status: 400 });
    }

    tags.forEach((tag) => revalidateTag(tag));

    return NextResponse.json({ revalidated: true });
}

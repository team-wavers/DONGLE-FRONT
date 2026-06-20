import { revalidateTag } from "next/cache";

const CROSS_APP_REVALIDATE_PREFIXES = ["main-banner", "club-schedule"];

function shouldNotifyClient(tag: string): boolean {
    return CROSS_APP_REVALIDATE_PREFIXES.some((prefix) => tag === prefix || tag.startsWith(`${prefix}-`));
}

async function notifyClientRevalidate(tags: string[]): Promise<void> {
    const clientBaseUrl = process.env.CLIENT_BASE_URL;
    const secret = process.env.REVALIDATE_SECRET;

    if (!clientBaseUrl || !secret) {
        return;
    }

    try {
        await fetch(`${clientBaseUrl}/api/revalidate`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "x-revalidate-secret": secret,
            },
            body: JSON.stringify({ tags }),
            signal: AbortSignal.timeout(3000),
        });
    } catch (error) {
        console.error("[revalidate] CLIENT 캐시 무효화 요청 실패", error);
    }
}

export function revalidateTags(tags: string[]) {
    tags.forEach((tag) => {
        revalidateTag(tag);
    });

    const crossAppTags = tags.filter(shouldNotifyClient);
    if (crossAppTags.length > 0) {
        void notifyClientRevalidate(crossAppTags);
    }
}

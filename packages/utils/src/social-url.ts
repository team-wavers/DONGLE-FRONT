export type SocialPlatform = "instagram" | "youtube";

const INSTAGRAM_HOSTS = new Set(["instagram.com", "www.instagram.com", "m.instagram.com"]);
const YOUTUBE_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com"]);
const YOUTUBE_SHORT_HOSTS = new Set(["youtu.be", "www.youtu.be"]);

function tryParseAbsoluteUrl(value: string) {
    try {
        return new URL(value);
    } catch {
        return null;
    }
}

function tryParseSocialUrl(value: string) {
    if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(value)) return tryParseAbsoluteUrl(value);
    if (value.startsWith("//")) return tryParseAbsoluteUrl(`https:${value}`);
    if (/^(?:www\.)?(instagram\.com|m\.instagram\.com|youtube\.com|m\.youtube\.com|youtu\.be)(?:\/|$)/i.test(value)) {
        return tryParseAbsoluteUrl(`https://${value}`);
    }
    return null;
}

function encodePathSegments(path: string) {
    return path.split("/").filter(Boolean).map((segment) => encodeURIComponent(segment)).join("/");
}

function normalizeInstagramUrl(value: string) {
    const trimmedValue = value.trim();
    if (!trimmedValue) return null;
    const parsedUrl = tryParseSocialUrl(trimmedValue);
    if (parsedUrl) {
        const hostname = parsedUrl.hostname.toLowerCase();
        if (INSTAGRAM_HOSTS.has(hostname)) {
            const pathname = parsedUrl.pathname === "/" ? "" : parsedUrl.pathname.replace(/\/+$/, "");
            return `https://www.instagram.com${pathname}${parsedUrl.search}${parsedUrl.hash}`;
        }
        return "https://www.instagram.com/";
    }
    const handle = trimmedValue.replace(/^https?:\/\/(?:www\.)?instagram\.com\/?/i, "").replace(/^\/\/(?:www\.)?instagram\.com\/?/i, "").replace(/^@/, "").replace(/^\/+|\/+$/g, "");
    if (!handle || /\s/.test(handle)) return "https://www.instagram.com/";
    return `https://www.instagram.com/${encodePathSegments(handle)}`;
}

function normalizeYoutubeUrl(value: string) {
    const trimmedValue = value.trim();
    if (!trimmedValue) return null;
    const parsedUrl = tryParseSocialUrl(trimmedValue);
    if (parsedUrl) {
        const hostname = parsedUrl.hostname.toLowerCase();
        const pathname = parsedUrl.pathname === "/" ? "" : parsedUrl.pathname.replace(/\/+$/, "");
        if (YOUTUBE_SHORT_HOSTS.has(hostname)) return `https://youtu.be${pathname}${parsedUrl.search}${parsedUrl.hash}`;
        if (YOUTUBE_HOSTS.has(hostname)) return `https://www.youtube.com${pathname}${parsedUrl.search}${parsedUrl.hash}`;
        return `https://www.youtube.com/results?search_query=${encodeURIComponent(trimmedValue)}`;
    }
    const normalizedValue = trimmedValue.replace(/^https?:\/\/(?:www\.)?(?:youtube\.com|m\.youtube\.com)\/?/i, "").replace(/^\/\/(?:www\.)?(?:youtube\.com|m\.youtube\.com)\/?/i, "").replace(/^https?:\/\/(?:www\.)?youtu\.be\/?/i, "").replace(/^\/\/(?:www\.)?youtu\.be\/?/i, "").replace(/^\/+|\/+$/g, "");
    if (!normalizedValue) return "https://www.youtube.com/";
    if (normalizedValue.startsWith("@")) return `https://www.youtube.com/@${encodeURIComponent(normalizedValue.slice(1))}`;
    if (/^(channel|user|c|shorts|live|embed)\//.test(normalizedValue) || /^(watch|playlist)(\?|$)/.test(normalizedValue)) return `https://www.youtube.com/${normalizedValue}`;
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(normalizedValue)}`;
}

export function normalizeSocialUrl(platform: SocialPlatform, value?: string | null) {
    if (!value) return null;
    return platform === "instagram" ? normalizeInstagramUrl(value) : normalizeYoutubeUrl(value);
}

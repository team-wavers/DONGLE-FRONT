interface BuildReportUpdatePayloadInput {
    title: string;
    content: string;
    imageUrls: string[];
    originalTitle: string;
    originalContent: string;
    originalImageUrls: string[];
}

type ReportUpdatePayload = {
    title?: string;
    content?: string;
    image_urls?: string[];
};

export function parseJsonStringArray(value: string | null | undefined) {
    if (!value) {
        return [] as string[];
    }

    const parsed = JSON.parse(value);

    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
}

export function mergeReportImageUrls(existingUrls: string[], removedUrls: string[], uploadedUrls: string[]) {
    const remainingExistingUrls = existingUrls.filter((url) => !removedUrls.includes(url));

    return [...remainingExistingUrls, ...uploadedUrls];
}

function areSameStringSet(left: string[], right: string[]) {
    if (left.length !== right.length) {
        return false;
    }

    return [...left].sort().join(",") === [...right].sort().join(",");
}

export function buildReportUpdatePayload({
    title,
    content,
    imageUrls,
    originalTitle,
    originalContent,
    originalImageUrls,
}: BuildReportUpdatePayloadInput): ReportUpdatePayload {
    const updatePayload: ReportUpdatePayload = {};

    if (title !== originalTitle) {
        updatePayload.title = title;
    }

    if (content !== originalContent) {
        updatePayload.content = content;
    }

    if (!areSameStringSet(imageUrls, originalImageUrls)) {
        updatePayload.image_urls = imageUrls;
    }

    return updatePayload;
}

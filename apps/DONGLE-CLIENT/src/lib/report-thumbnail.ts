const IMG_SRC_PATTERN = /<img[^>]*\ssrc=["']([^"']+)["'][^>]*>/i;

/**
 * 활동보고서 썸네일 URL을 결정한다.
 * 서버가 내려주는 image_urls를 우선 사용하고, 없을 때만 본문(content) HTML에서 첫 이미지를 추출한다.
 */
export function resolveReportThumbnailUrl(imageUrls: string[], content: string): string | null {
    const serverThumbnail = imageUrls.find((url) => url.trim().length > 0);
    if (serverThumbnail) {
        return serverThumbnail;
    }

    const match = content.match(IMG_SRC_PATTERN);
    return match ? match[1] : null;
}

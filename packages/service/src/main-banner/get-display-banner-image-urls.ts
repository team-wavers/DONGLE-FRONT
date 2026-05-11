import type { MainBanner } from "@dongle/types/main-banner/main-banner";

export interface DisplayMainBannerItem {
    imageUrl: string;
    linkUrl: string | null;
}

/**
 * 현재 시점이 노출 기간(publish_start_at ~ publish_end_at) 내인지 여부
 */
function isInPublishPeriod(banner: MainBanner, now: Date): boolean {
    const start = new Date(banner.publish_start_at);
    const end = new Date(banner.publish_end_at);
    return start <= now && now <= end;
}

export function normalizeDisplayBannerLinkUrl(value: string | null | undefined): string | null {
    const trimmed = value?.trim() ?? "";

    if (!trimmed) return null;

    if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
        return trimmed;
    }

    try {
        const url = new URL(trimmed);
        return url.protocol === "http:" || url.protocol === "https:" ? trimmed : null;
    } catch {
        return null;
    }
}

/**
 * 사용자 노출용 메인 배너 목록에서 이미지와 링크 정보를 추출
 * - is_active, image_url 유효, 노출 기간 내인 배너만 포함
 * - link_url은 http(s) 또는 내부 경로만 허용
 */
export function getDisplayMainBannerItems(banners: MainBanner[], now = new Date()): DisplayMainBannerItem[] {
    return banners
        .filter(
            (banner) =>
                banner.is_active &&
                Boolean(banner.image_url?.trim()) &&
                isInPublishPeriod(banner, now)
        )
        .map((banner) => ({
            imageUrl: banner.image_url,
            linkUrl: normalizeDisplayBannerLinkUrl(banner.link_url),
        }));
}

/**
 * @deprecated 사용자 배너 클릭 링크가 필요하면 getDisplayMainBannerItems를 사용한다.
 */
export function getDisplayBannerImageUrls(banners: MainBanner[]): string[] {
    return getDisplayMainBannerItems(banners).map((banner) => banner.imageUrl);
}

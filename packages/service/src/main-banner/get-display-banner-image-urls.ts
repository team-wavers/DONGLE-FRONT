import type { MainBanner } from "@dongle/types/main-banner/main-banner";

/**
 * 현재 시점이 노출 기간(publish_start_at ~ publish_end_at) 내인지 여부
 */
function isInPublishPeriod(banner: MainBanner): boolean {
    const now = new Date();
    const start = new Date(banner.publish_start_at);
    const end = new Date(banner.publish_end_at);
    return start <= now && now <= end;
}

/**
 * 사용자 노출용 메인 배너 목록에서 이미지 URL만 추출
 * - is_active, image_url 유효, 노출 기간 내인 배너만 포함
 */
export function getDisplayBannerImageUrls(banners: MainBanner[]): string[] {
    return banners
        .filter(
            (banner) =>
                banner.is_active &&
                Boolean(banner.image_url?.trim()) &&
                isInPublishPeriod(banner)
        )
        .map((banner) => banner.image_url);
}

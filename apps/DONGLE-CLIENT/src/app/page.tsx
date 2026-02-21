import { getActiveMainBannerListService, getClubListService } from "@dongle/service";
import ClubMainClient from "@/components/main/club-main-client";

export default async function HomePage() {
    const [clubListResponse, mainBannerResponse] = await Promise.all([
        getClubListService(),
        getActiveMainBannerListService(false),
    ]);

    const clubs = clubListResponse.isSuccess && clubListResponse.result ? clubListResponse.result : [];
    const bannerImageUrls =
        mainBannerResponse.isSuccess && mainBannerResponse.result
            ? mainBannerResponse.result
                  .filter((banner) => banner.is_active && banner.image_url && banner.image_url.length > 0)
                  .map((banner) => banner.image_url)
            : [];

    return <ClubMainClient clubs={clubs} bannerImageUrls={bannerImageUrls} />;
}

import {
    getActiveMainBannerListService,
    getClubListService,
    getDisplayBannerImageUrls,
} from "@dongle/service";
import ClubMainClient from "@/components/main/club-main-client";

export default async function HomePage() {
    const [clubListResponse, mainBannerResponse] = await Promise.all([
        getClubListService(),
        getActiveMainBannerListService(false),
    ]);

    const clubs = clubListResponse.isSuccess && clubListResponse.result ? clubListResponse.result : [];
    const bannerImageUrls =
        mainBannerResponse.isSuccess && mainBannerResponse.result
            ? getDisplayBannerImageUrls(mainBannerResponse.result)
            : [];

    return <ClubMainClient clubs={clubs} bannerImageUrls={bannerImageUrls} />;
}

import {
    getClubListService,
    getDisplayMainBannerItems,
    getPublicMainBannerListService,
} from "@/lib/server/cached-services";

export async function loadHomePageViewData() {
    const [clubListResponse, mainBannerResponse] = await Promise.allSettled([
        getClubListService(),
        getPublicMainBannerListService(),
    ]);

    const clubListResult = clubListResponse.status === "fulfilled" ? clubListResponse.value : null;
    const mainBannerResult = mainBannerResponse.status === "fulfilled" ? mainBannerResponse.value : null;
    const clubsLoadFailed = !clubListResult?.isSuccess;
    const clubs =
        clubListResult?.isSuccess && clubListResult.result
            ? clubListResult.result.map((club) => ({
                  id: club.id,
                  name: club.name,
                  icon_url: club.icon_url,
                  category: club.category,
                  tags: club.tags,
                  is_recruiting: club.is_recruiting,
              }))
            : [];
    const banners =
        mainBannerResult?.isSuccess && mainBannerResult.result
            ? getDisplayMainBannerItems(mainBannerResult.result)
            : [];

    return { clubs, banners, clubsLoadFailed };
}

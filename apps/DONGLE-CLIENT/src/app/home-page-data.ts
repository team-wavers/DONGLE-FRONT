import {
    getClubListService,
    getDisplayMainBannerItems,
    getPublicMainBannerListService,
} from "@/lib/server/cached-services";

export async function loadHomePageBanners(now = new Date()) {
    const mainBannerResponse = await Promise.allSettled([getPublicMainBannerListService()]);
    const mainBannerResult = mainBannerResponse[0].status === "fulfilled" ? mainBannerResponse[0].value : null;

    return mainBannerResult?.isSuccess && mainBannerResult.result
        ? getDisplayMainBannerItems(mainBannerResult.result, now)
        : [];
}

export async function loadHomePageClubs() {
    const clubListResponse = await Promise.allSettled([getClubListService()]);
    const clubListResult = clubListResponse[0].status === "fulfilled" ? clubListResponse[0].value : null;
    const clubsLoadFailed = !clubListResult?.isSuccess;
    const clubs =
        clubListResult?.isSuccess && clubListResult.result
            ? clubListResult.result.map((club) => ({
                  id: club.id,
                  name: club.name,
                  icon_url: club.icon_url,
                  category: club.category,
                  tags: club.tags ?? [],
                  is_recruiting: club.is_recruiting,
                  recruit_end: club.recruit_end ?? null,
              }))
            : [];

    return { clubs, clubsLoadFailed };
}

export async function loadHomePageViewData(now = new Date()) {
    const [banners, clubsResult] = await Promise.all([loadHomePageBanners(now), loadHomePageClubs()]);

    return { ...clubsResult, banners };
}

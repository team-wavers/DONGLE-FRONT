import { Suspense } from "react";
import {
    getActiveMainBannerListService,
    getClubListService,
    getDisplayBannerImageUrls,
} from "@/lib/server/cached-services";
import ClubMainClient from "@/components/main/club-main-client";
import { Skeleton } from "@dongle/ui/skeleton";

async function HomePageContent() {
    const [clubListResponse, mainBannerResponse] = await Promise.all([
        getClubListService(),
        getActiveMainBannerListService(false),
    ]);

    const clubs =
        clubListResponse.isSuccess && clubListResponse.result
            ? clubListResponse.result.map((club) => ({
                  id: club.id,
                  name: club.name,
                  category: club.category,
                  tags: club.tags,
                  is_recruiting: club.is_recruiting,
              }))
            : [];
    const bannerImageUrls =
        mainBannerResponse.isSuccess && mainBannerResponse.result
            ? getDisplayBannerImageUrls(mainBannerResponse.result)
            : [];

    return <ClubMainClient clubs={clubs} bannerImageUrls={bannerImageUrls} />;
}

function HomePageFallback() {
    return (
        <section className="py-8 md:py-12 space-y-8">
            <Skeleton className="h-64 md:h-80 w-full rounded-3xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-72 w-full rounded-2xl" />
                <Skeleton className="h-72 w-full rounded-2xl" />
                <Skeleton className="h-72 w-full rounded-2xl" />
            </div>
        </section>
    );
}

export default function HomePage() {
    return (
        <Suspense fallback={<HomePageFallback />}>
            <HomePageContent />
        </Suspense>
    );
}

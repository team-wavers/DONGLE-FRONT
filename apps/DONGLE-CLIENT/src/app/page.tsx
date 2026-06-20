import { Suspense } from "react";
import ClubMainClient from "@/components/main/club-main-client";
import { loadHomePageViewData } from "./home-page-data";
import { Skeleton } from "@dongle/ui/skeleton";
import type { DisplayMainBannerItem } from "@dongle/service/main-banner/get-display-banner-image-urls";

const MOCK_MAIN_BANNERS: DisplayMainBannerItem[] = [
    {
        imageUrl: "/logo/logo-og.png",
        linkUrl: "/clubs",
    },
];

function getDevelopmentFallbackBanners(banners: DisplayMainBannerItem[]) {
    if (banners.length > 0 || process.env.NODE_ENV !== "development") {
        return banners;
    }

    return MOCK_MAIN_BANNERS;
}

async function HomePageContent() {
    const { clubs, banners, clubsLoadFailed } = await loadHomePageViewData();

    return (
        <ClubMainClient
            clubs={clubs}
            banners={getDevelopmentFallbackBanners(banners)}
            clubsLoadFailed={clubsLoadFailed}
        />
    );
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

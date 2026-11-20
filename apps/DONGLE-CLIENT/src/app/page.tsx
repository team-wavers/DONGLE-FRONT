import type { Metadata } from "next";
import ClubMainClient from "@/components/main/club-main-client";
import ClubMainHeroBannerCarousel from "@/components/main/club-main-hero-banner-carousel";
import HomeActivitySection from "@/components/main/home-activity-section";
import { SITE_HOME_TITLE } from "@/lib/site";
import { Skeleton } from "@dongle/ui/skeleton";
import { Suspense } from "react";
import { loadHomePageBanners, loadHomePageClubs } from "./home-page-data";
import { loadHomeActivityReports } from "./home-activity-data";

export const metadata: Metadata = {
    title: { absolute: SITE_HOME_TITLE },
};

async function HomeBannerSection() {
    const banners = await loadHomePageBanners();

    return banners.length > 0 ? <ClubMainHeroBannerCarousel banners={banners} /> : null;
}

async function HomeClubListSection() {
    const { clubs, clubsLoadFailed } = await loadHomePageClubs();

    return <ClubMainClient clubs={clubs} clubsLoadFailed={clubsLoadFailed} />;
}

async function HomeRecentActivitySection() {
    const reports = await loadHomeActivityReports();

    return <HomeActivitySection reports={reports} />;
}

function ActivityFallback() {
    return (
        <section aria-label="최근 활동 불러오는 중" className="space-y-4 border-b border-zinc-200 pb-7 md:pb-8">
            <div className="space-y-2">
                <Skeleton className="h-7 w-36" />
                <Skeleton className="h-5 w-64 max-w-full" />
            </div>
            <div className="flex gap-4 overflow-hidden md:grid md:grid-cols-4">
                {Array.from({ length: 4 }, (_, index) => (
                    <div key={index} className="basis-[78%] shrink-0 space-y-3 md:basis-auto">
                        <Skeleton className="aspect-[16/10] w-full rounded-xl" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-5 w-full" />
                    </div>
                ))}
            </div>
        </section>
    );
}

function BannerFallback() {
    return <Skeleton className="h-64 md:h-80 w-full rounded-3xl" />;
}

function ClubListFallback() {
    return (
        <section className="py-8 md:py-12 space-y-8">
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
        <section className="space-y-6 py-6 md:py-10">
            <Suspense fallback={<BannerFallback />}>
                <HomeBannerSection />
            </Suspense>
            <Suspense fallback={<ActivityFallback />}>
                <HomeRecentActivitySection />
            </Suspense>
            <Suspense fallback={<ClubListFallback />}>
                <HomeClubListSection />
            </Suspense>
        </section>
    );
}

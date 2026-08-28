import ClubMainClient from "@/components/main/club-main-client";
import ClubMainHeroBannerCarousel from "@/components/main/club-main-hero-banner-carousel";
import { Skeleton } from "@dongle/ui/skeleton";
import { Suspense } from "react";
import { loadHomePageBanners, loadHomePageClubs } from "./home-page-data";

async function HomeBannerSection() {
    const banners = await loadHomePageBanners();

    return banners.length > 0 ? <ClubMainHeroBannerCarousel banners={banners} /> : null;
}

async function HomeClubListSection() {
    const { clubs, clubsLoadFailed } = await loadHomePageClubs();

    return <ClubMainClient clubs={clubs} clubsLoadFailed={clubsLoadFailed} />;
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
            <Suspense fallback={<ClubListFallback />}>
                <HomeClubListSection />
            </Suspense>
        </section>
    );
}

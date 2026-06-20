import MainBannerList from "@/feature/main-banner/components/main-banner-list";
import { getAdminMainBannerListService } from "@/lib/server/cached-services";
import Link from "next/link";
import { Button } from "@dongle/ui/button";
import type { MainBanner } from "@dongle/types/main-banner/main-banner";

const MOCK_MAIN_BANNERS: MainBanner[] = [
    {
        id: 999001,
        image_url: "/logo/logo-full.svg",
        link_url: "/clubs",
        publish_start_at: "2026-01-01T00:00:00.000Z",
        publish_end_at: "2026-12-31T23:59:59.999Z",
        is_active: true,
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
        deleted_at: null,
    },
];

function getDevelopmentFallbackBanners(banners: MainBanner[]) {
    if (banners.length > 0 || process.env.NODE_ENV !== "development") {
        return banners;
    }

    return MOCK_MAIN_BANNERS;
}

function BannerPageActions() {
    return (
        <Button asChild className="h-10 px-5 font-semibold">
            <Link href="/admin/banner/create">신규등록</Link>
        </Button>
    );
}

async function loadBannerListViewModel() {
    try {
        const { result, isSuccess } = await getAdminMainBannerListService();

        if (!isSuccess || !result) {
            return { banners: [] as MainBanner[], loadFailed: true };
        }

        return { banners: getDevelopmentFallbackBanners(result), loadFailed: false };
    } catch {
        return { banners: [] as MainBanner[], loadFailed: true };
    }
}

async function BannerListSection() {
    const { banners, loadFailed } = await loadBannerListViewModel();

    return <MainBannerList banners={banners} loadFailed={loadFailed} />;
}

export default function BannerManagementPage() {
    return (
        <div className="flex w-full flex-col gap-4">
            <div className="flex justify-end">
                <BannerPageActions />
            </div>
            <BannerListSection />
        </div>
    );
}

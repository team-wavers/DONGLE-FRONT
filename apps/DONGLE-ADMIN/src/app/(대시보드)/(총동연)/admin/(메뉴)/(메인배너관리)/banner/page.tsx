import MainBannerList from "@/feature/main-banner/components/main-banner-list";
import { getAdminMainBannerListService } from "@/lib/server/cached-services";
import { ImageIcon } from "lucide-react";
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

async function BannerListSection() {
    try {
        const { result, isSuccess, error } = await getAdminMainBannerListService();

        if (!isSuccess || !result) {
            return (
                <>
                    <div className="text-center py-8 text-muted-foreground">
                        <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>{error?.message || "배너 목록을 불러오는 중 오류가 발생했습니다."}</p>
                    </div>
                </>
            );
        }

        const banners = getDevelopmentFallbackBanners(result);

        if (banners.length === 0) {
            return (
                <>
                    <div className="text-center py-8 text-muted-foreground">
                        <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>등록된 배너가 없습니다.</p>
                    </div>
                </>
            );
        }

        return (
            <>
                <MainBannerList banners={banners} />
            </>
        );
    } catch {
        return (
            <>
                <div className="text-center py-8 text-muted-foreground">
                    <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>배너 목록을 불러오는 중 예기치 못한 오류가 발생했습니다.</p>
                </div>
            </>
        );
    }
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

import { Suspense } from "react";
import MainBannerList from "@/feature/main-banner/components/main-banner-list";
import { getActiveMainBannerListService } from "@/lib/server/cached-services";
import { ImageIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@dongle/ui/button";
import { Skeleton } from "@dongle/ui/skeleton";

function BannerPageActions() {
    return (
        <div className="flex justify-end mb-4">
            <Link href="/admin/banner/create">
                <Button className="h-11 px-6 text-base font-semibold">신규등록</Button>
            </Link>
        </div>
    );
}

async function BannerListSection() {
    try {
        const { result, isSuccess, error } = await getActiveMainBannerListService();

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

        if (result.length === 0) {
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
                <MainBannerList banners={result} />
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

function BannerListFallback() {
    return (
        <div className="grid gap-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
        </div>
    );
}

export default function BannerManagementPage() {
    return (
        <>
            <BannerPageActions />
            <Suspense fallback={<BannerListFallback />}>
                <BannerListSection />
            </Suspense>
        </>
    );
}

import { Suspense } from "react";
import { getAdminMainBannerService } from "@/lib/server/cached-services";
import { Skeleton } from "@dongle/ui/skeleton";
import MainBannerEditSection from "@/feature/main-banner/components/main-banner-edit-section";

interface EditMainBannerPageProps {
    params: Promise<{ id: string }>;
}

async function EditMainBannerContent({ bannerId }: { bannerId: number }) {
    const { result, isSuccess, error } = await getAdminMainBannerService(bannerId);

    if (!isSuccess || !result) {
        return <div className="text-sm text-red-500">{error?.message || "배너 목록을 불러오지 못했습니다."}</div>;
    }

    return <MainBannerEditSection banner={result} />;
}

function EditMainBannerFallback() {
    return (
        <div className="flex flex-col gap-8">
            <Skeleton className="h-[30rem] w-full rounded-2xl" />
            <div className="grid grid-cols-2 gap-3 pt-2">
                <Skeleton className="h-11 w-full" />
                <Skeleton className="h-11 w-full" />
            </div>
        </div>
    );
}

export default async function EditMainBannerPage({ params }: EditMainBannerPageProps) {
    const { id } = await params;
    const bannerId = Number(id);

    if (Number.isNaN(bannerId)) {
        return <div className="text-sm text-red-500">잘못된 배너 ID입니다.</div>;
    }

    return (
        <Suspense fallback={<EditMainBannerFallback />}>
            <EditMainBannerContent bannerId={bannerId} />
        </Suspense>
    );
}

import { getAdminMainBannerService } from "@/lib/server/cached-services";
import MainBannerEditSection from "@/feature/main-banner/components/main-banner-edit-section";
import { notFound } from "next/navigation";

interface EditMainBannerPageProps {
    params: Promise<{ id: string }>;
}

async function EditMainBannerContent({ bannerId }: { bannerId: number }) {
    const { result, isSuccess, error } = await getAdminMainBannerService(bannerId);

    if (!isSuccess) {
        if (error.status === 404) {
            notFound();
        }

        throw new Error("배너 정보를 불러오는데 실패했습니다.");
    }

    if (!result) {
        return <div className="text-sm text-red-500">배너 정보를 불러오지 못했습니다.</div>;
    }

    return <MainBannerEditSection banner={result} />;
}

export default async function EditMainBannerPage({ params }: EditMainBannerPageProps) {
    const { id } = await params;
    const bannerId = Number(id);

    if (Number.isNaN(bannerId)) {
        return <div className="text-sm text-red-500">잘못된 배너 ID입니다.</div>;
    }

    return <EditMainBannerContent bannerId={bannerId} />;
}

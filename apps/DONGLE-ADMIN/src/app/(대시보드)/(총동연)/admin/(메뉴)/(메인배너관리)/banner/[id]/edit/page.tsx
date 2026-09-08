import { getAdminMainBannerService } from "@/lib/server/cached-services";
import MainBannerEditSection from "@/feature/main-banner/components/main-banner-edit-section";
import { notFound } from "next/navigation";

interface EditMainBannerPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditMainBannerPage({ params }: EditMainBannerPageProps) {
    const { id } = await params;
    const bannerId = Number(id);

    if (Number.isNaN(bannerId)) {
        return <div className="text-sm text-red-500">잘못된 배너 ID입니다.</div>;
    }

    let response;

    try {
        response = await getAdminMainBannerService(bannerId);
    } catch {
        throw new Error("배너 정보를 불러오는데 실패했습니다.");
    }

    if (!response.isSuccess) {
        if (response.error.status === 404) {
            notFound();
        }

        throw new Error("배너 정보를 불러오는데 실패했습니다.");
    }

    if (!response.result) {
        return <div className="text-sm text-red-500">배너 정보를 불러오지 못했습니다.</div>;
    }

    return <MainBannerEditSection banner={response.result} />;
}

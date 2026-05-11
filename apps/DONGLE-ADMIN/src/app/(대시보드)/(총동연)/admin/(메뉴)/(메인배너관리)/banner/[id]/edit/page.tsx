import { Suspense } from "react";
import MainBannerForm from "@/feature/main-banner/components/main-banner-form";
import { updateMainBannerAction } from "@/feature/main-banner/action/main-banner-form.action";
import { getAdminMainBannerService } from "@/lib/server/cached-services";
import { Button } from "@dongle/ui/button";
import { Skeleton } from "@dongle/ui/skeleton";
import MainBannerDeleteButton from "@/feature/main-banner/components/main-banner-delete-button";

interface EditMainBannerPageProps {
    params: Promise<{ id: string }>;
}

async function EditMainBannerContent({ bannerId }: { bannerId: number }) {
    const { result, isSuccess, error } = await getAdminMainBannerService(bannerId);

    if (!isSuccess || !result) {
        return <div className="text-sm text-red-500">{error?.message || "배너 목록을 불러오지 못했습니다."}</div>;
    }

    return (
        <div className="flex flex-col gap-8">
            <MainBannerForm
                customAction={updateMainBannerAction}
                initialData={result}
                submitText="수정"
                loadingText="수정 중..."
                successMessage="배너가 수정되었습니다."
                formId="main-banner-edit-form"
                showSubmitButton={false}
            />

            <div className="grid grid-cols-2 gap-3 pt-2">
                <MainBannerDeleteButton bannerId={bannerId} />
                <Button type="submit" form="main-banner-edit-form" className="w-full">
                    수정
                </Button>
            </div>
        </div>
    );
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

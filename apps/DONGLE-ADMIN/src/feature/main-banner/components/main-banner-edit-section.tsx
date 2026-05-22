"use client";

import { useCallback, useState } from "react";
import { LoadingButton } from "@/shared/components/atoms/button/loading-button/loading-button";
import { AdminFormActions } from "@/shared/components/molecules/layout/admin-form-layout/admin-form-layout";
import type { MainBanner } from "@dongle/types/main-banner/main-banner";
import MainBannerDeleteButton from "./main-banner-delete-button";
import MainBannerForm from "./main-banner-form";

interface MainBannerEditSectionProps {
    banner: MainBanner;
}

export default function MainBannerEditSection({ banner }: MainBannerEditSectionProps) {
    const [loadingState, setLoadingState] = useState({
        loading: false,
        loadingText: "수정 중...",
    });

    const handleLoadingChange = useCallback((nextLoadingState: { loading: boolean; loadingText: string }) => {
        setLoadingState(nextLoadingState);
    }, []);

    return (
        <div className="flex flex-col gap-8">
            <MainBannerForm
                initialData={banner}
                submitText="수정"
                loadingText="수정 중..."
                successMessage="배너가 수정되었습니다."
                formId="main-banner-edit-form"
                showSubmitButton={false}
                onLoadingChange={handleLoadingChange}
            />

            <AdminFormActions className="mx-auto w-full max-w-4xl">
                <MainBannerDeleteButton bannerId={banner.id} />
                <LoadingButton
                    type="submit"
                    form="main-banner-edit-form"
                    loading={loadingState.loading}
                    loadingText={loadingState.loadingText}
                    className="w-full">
                    수정
                </LoadingButton>
            </AdminFormActions>
        </div>
    );
}

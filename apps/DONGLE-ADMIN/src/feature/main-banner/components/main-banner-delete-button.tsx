"use client";

import { ConfirmButton } from "@dongle/ui/confirm-button";
import { deleteMainBannerAction } from "@/feature/main-banner/action/main-banner-form.action";

interface MainBannerDeleteButtonProps {
    bannerId: number;
}

export default function MainBannerDeleteButton({ bannerId }: MainBannerDeleteButtonProps) {
    return (
        <ConfirmButton
            triggerText="삭제"
            title="배너 삭제 확인"
            description="정말 이 배너를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
            confirmText="삭제"
            cancelText="취소"
            loadingText="삭제 중..."
            triggerVariant="destructive"
            triggerClassName="w-full"
            confirmVariant="destructive"
            confirmClassName="w-full"
            onConfirm={async () => {
                await deleteMainBannerAction(bannerId, new FormData());
            }}
        />
    );
}


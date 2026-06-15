"use client";

import { ConfirmButton } from "@dongle/ui/confirm-button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteMainBannerAction } from "@/feature/main-banner/action/delete-main-banner.action";

interface MainBannerDeleteButtonProps {
    bannerId: number;
}

export default function MainBannerDeleteButton({ bannerId }: MainBannerDeleteButtonProps) {
    const router = useRouter();

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
            onConfirm={async () => {
                const result = await deleteMainBannerAction(bannerId);

                if (!result.ok) {
                    toast.error(result.formError ?? "배너 삭제에 실패했습니다.");
                    throw new Error(result.formError ?? "배너 삭제 실패");
                }

                toast.success(result.message ?? "배너가 삭제되었습니다.");
                router.push(result.redirectTo ?? "/admin/banner");
                router.refresh();
            }}
        />
    );
}

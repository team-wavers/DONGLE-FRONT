"use client";

import { LogOutIcon } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { LoadingButton } from "@/shared/ui/feedback/button/loading-button/loading-button";
import { useRouter } from "next/navigation";
import { requestLogout } from "@/feature/auth/utils/request-logout";

interface LogoutButtonProps {
    accessToken: string | null;
}

export default function LogoutButton({ accessToken }: LogoutButtonProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    if (!accessToken) {
        return null;
    }

    return (
        <LoadingButton
            variant="outline"
            disabled={isPending}
            onClick={() => {
                startTransition(async () => {
                    const { isSuccess } = await requestLogout();
                    if (!isSuccess) {
                        toast.error("로그아웃에 실패했습니다. 다시 시도해주세요.");
                        return;
                    }
                    router.replace("/login");
                    router.refresh();
                });
            }}
            className="font-bold text-zinc-700 w-full text-sm md:text-base"
        >
            <LogOutIcon className="w-4 h-4 hidden md:block" />
            로그아웃
        </LoadingButton>
    );
}

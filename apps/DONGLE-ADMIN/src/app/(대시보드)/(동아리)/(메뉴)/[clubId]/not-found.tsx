"use client";

import { Users, LogOut } from "lucide-react";
import { logoutAction } from "@/feature/auth/action/logout-form.action";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoadingButton } from "@/shared/ui/feedback/button/loading-button/loading-button";

export default function NotFound() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleLogout = () => {
        startTransition(async () => {
            await logoutAction();
            router.push("/login");
        });
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-full px-4">
            <div className="w-full max-w-sm text-center space-y-6">
                <div className="mx-auto w-14 h-14 bg-muted rounded-full flex items-center justify-center">
                    <Users className="w-7 h-7 text-muted-foreground" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-xl font-semibold text-foreground">동아리가 존재하지 않습니다</h1>
                    <p className="text-sm text-muted-foreground">
                        관리자에게 문의하시거나 로그아웃 후 다시 시도해 주세요.
                    </p>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                    <LoadingButton
                        variant="default"
                        size="sm"
                        className="w-full"
                        loading={isPending}
                        loadingText="로그아웃 중..."
                        onClick={handleLogout}>
                        <LogOut className="w-4 h-4 mr-2" />
                        로그아웃
                    </LoadingButton>
                </div>
            </div>
        </div>
    );
}

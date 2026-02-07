"use client";

import { logoutAction } from "@/feature/auth/action/logout-form.action";
import { LogOutIcon } from "lucide-react";
import { toast } from "sonner";
import { useTransition } from "react";
import { LoadingButton } from "@/components/atoms/button/loading-button/loading-button";
import { useRouter } from "next/navigation";

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
          const { success } = await logoutAction();
          if (!success) toast.error("로그아웃에 실패했습니다");

          router.push("/login");
        });
      }}
      className="font-bold text-zinc-700 w-full text-sm md:text-base"
    >
      <LogOutIcon className="w-4 h-4 hidden md:block" />
      로그아웃
    </LoadingButton>
  );
}

"use client";
import { Button } from "@dongle/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface GoBackButtonProps {
  fallbackHref?: string;
}

export default function GoBackButton({ fallbackHref }: GoBackButtonProps) {
  const router = useRouter();

  const handleGoBack = () => {
    if (window.__dongleUnsavedChangesPrompt && !window.__dongleUnsavedChangesPrompt()) {
      return;
    }

    if (window.history.length > 1) {
      router.back();
      return;
    }

    if (fallbackHref) {
      router.push(fallbackHref);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleGoBack}
      className="cursor-pointer"
    >
      <ArrowLeft className="h-4 w-4" />
      뒤로가기
    </Button>
  );
}

"use client";
import { Button } from "@dongle/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function GoBackButton() {
  const router = useRouter();
  return (
    <Button
      variant="outline"
      onClick={() => router.back()}
      className="cursor-pointer"
    >
      <ArrowLeft className="h-4 w-4" />
      뒤로가기
    </Button>
  );
}

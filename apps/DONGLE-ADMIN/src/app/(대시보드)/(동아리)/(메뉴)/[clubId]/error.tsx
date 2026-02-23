"use client";

import { useEffect } from "react";
import { Button } from "@dongle/ui/button";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("동아리 페이지 에러:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen w-full p-4 md:p-16">
      <div className="w-full max-w-sm text-center space-y-6">
        {/* 아이콘 */}
        <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-destructive" />
        </div>

        {/* 제목 */}
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-foreground">
            오류가 발생했습니다
          </h1>
        </div>

        {/* 버튼들 */}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            뒤로가기
          </Button>
          <Button
            onClick={reset}
            className="flex-1 bg-primary hover:bg-primary/90"
            size="sm"
          >
            <RefreshCw className="w-4 h-4" />
            다시 시도
          </Button>
        </div>
      </div>
    </div>
  );
}

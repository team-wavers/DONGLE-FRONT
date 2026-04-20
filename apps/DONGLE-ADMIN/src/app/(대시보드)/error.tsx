"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { Button } from "@dongle/ui/button";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
    useEffect(() => {
        Sentry.captureException(error);
        console.error("대시보드 페이지 에러:", error);
    }, [error]);

    return (
        <div className="flex items-center justify-center p-4 md:p-16 w-full">
            <div className="w-full max-w-sm text-center space-y-6">
                <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-xl font-semibold text-foreground">오류가 발생했습니다</h1>
                    <p className="text-sm text-muted-foreground">
                        페이지를 불러오는 중 문제가 생겼습니다.
                    </p>
                </div>

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
                    <Button onClick={reset} className="flex-1 bg-primary hover:bg-primary/90" size="sm">
                        <RefreshCw className="w-4 h-4 mr-1" />
                        다시 시도
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href="/">홈으로</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}

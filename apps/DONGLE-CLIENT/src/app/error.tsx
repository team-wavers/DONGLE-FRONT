"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@dongle/ui/button";
import Link from "next/link";

interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function RootError({ error, reset }: ErrorProps) {
    const router = useRouter();

    useEffect(() => {
        Sentry.captureException(error);
        console.error("클라이언트 페이지 에러:", error);
    }, [error]);

    return (
        <div className="flex w-full items-center justify-center py-20">
            <div className="w-full max-w-sm space-y-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-xl font-semibold text-foreground">오류가 발생했습니다</h1>
                    <p className="text-sm text-muted-foreground">
                        페이지를 불러오는 중 문제가 생겼습니다.
                    </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                    <Button variant="outline" className="flex-1" onClick={() => router.back()}>
                        <ArrowLeft className="mr-1 h-4 w-4" />
                        뒤로가기
                    </Button>
                    <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={reset}>
                        <RefreshCw className="mr-1 h-4 w-4" />
                        다시 시도
                    </Button>
                    <Button variant="outline" className="flex-1" asChild>
                        <Link href="/">홈으로</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}

"use client";

import * as Sentry from "@sentry/nextjs";
import { Button } from "@dongle/ui/button";

export default function SentryExamplePageClient() {
    const handleCaptureException = () => {
        Sentry.captureException(new Error("dongle-client sentry example page test error"));
    };

    const handleUnhandledError = () => {
        throw new Error("dongle-client sentry example page unhandled error");
    };

    return (
        <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col justify-center gap-6 py-16">
            <div className="space-y-2">
                <h1 className="text-2xl font-semibold text-foreground">Sentry 테스트 페이지</h1>
                <p className="text-sm text-muted-foreground">
                    버튼을 눌러 `dongle-client` 프로젝트에 테스트 에러를 전송할 수 있습니다.
                </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
                <Button onClick={handleCaptureException}>captureException 보내기</Button>
                <Button variant="outline" onClick={handleUnhandledError}>
                    Unhandled Error 발생시키기
                </Button>
            </div>
        </div>
    );
}

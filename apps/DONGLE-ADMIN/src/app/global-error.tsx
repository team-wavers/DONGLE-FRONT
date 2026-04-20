"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { Button } from "@dongle/ui/button";
import { useRouter } from "next/navigation";

function isServerActionMismatchError(error: Error) {
    return (
        error.name === "UnrecognizedActionError" ||
        error.message.includes("failed-to-find-server-action") ||
        error.message.includes("Server Action") ||
        error.message.includes("was not found on the server")
    );
}

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const router = useRouter();
    const isActionMismatch = isServerActionMismatchError(error);

    useEffect(() => {
        Sentry.captureException(error);
    }, [error]);

    return (
        <html lang="ko">
            <body className="bg-background text-foreground">
                <main className="flex min-h-screen flex-col items-center justify-center px-6">
                    <div className="space-y-4 text-center">
                        <h1 className="text-2xl font-bold tracking-tighter sm:text-3xl">⚠️ 에러가 발생했습니다!</h1>
                        <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                            {isActionMismatch
                                ? "배포가 갱신되면서 이전 페이지 요청이 만료되었습니다. 새로고침 후 다시 로그인해주세요."
                                : "잠시 후 다시 시도해주세요."}
                        </p>
                        <div className="flex gap-3 justify-center">
                            <Button onClick={() => (isActionMismatch ? window.location.reload() : reset())}>
                                {isActionMismatch ? "새로고침" : "다시 시도"}
                            </Button>
                            <Button variant="outline" onClick={() => window.location.reload()}>
                                새로고침
                            </Button>
                            <Button variant="outline" onClick={() => router.push("/")}>
                                홈으로
                            </Button>
                        </div>
                    </div>
                </main>
            </body>
        </html>
    );
}

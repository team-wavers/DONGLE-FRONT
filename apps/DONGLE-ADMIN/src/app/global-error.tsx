"use client";

import { Button } from "@dongle/ui/button";
import { useRouter } from "next/navigation";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
    const router = useRouter();

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
            <div className="space-y-4 text-center">
                <h1 className="text-2xl font-bold tracking-tighter sm:text-3xl">⚠️ 에러가 발생했습니다!</h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">잠시 후 다시 시도해주세요.</p>
                <div className="flex gap-3 justify-center">
                    <Button onClick={() => reset()}>다시 시도</Button>
                    <Button variant="outline" onClick={() => window.location.reload()}>
                        새로고침
                    </Button>
                    <Button variant="outline" onClick={() => router.push("/")}>
                        홈으로
                    </Button>
                </div>
            </div>
        </main>
    );
}

"use client";

import { Button } from "@dongle/ui";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NotFound() {
    const router = useRouter();

    const handleBack = () => {
        router.back();
    };

    return (
        <div className="flex flex-col items-center h-screen gap-4 py-32">
            <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center">
                <Search className="w-6 h-6 text-zinc-500" />
            </div>
            <p className="text-zinc-500 text-lg font-bold">요청하신 동아리를 찾을 수 없습니다.</p>
            <div className="flex gap-2">
                <Button variant="outline" onClick={handleBack}>
                    뒤로가기
                </Button>
                <Button asChild>
                    <Link href="/">홈으로</Link>
                </Button>
            </div>
        </div>
    );
}

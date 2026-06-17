"use client";

import { Button } from "@dongle/ui";
import { Search } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function NotFound() {
    const router = useRouter();
    const params = useParams<{ clubId: string }>();
    const clubId = params?.clubId;

    const handleBack = () => {
        router.back();
    };

    return (
        <div className="flex flex-col items-center h-screen gap-4 py-32">
            <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center">
                <Search className="w-6 h-6 text-zinc-500" />
            </div>
            <p className="text-zinc-500 text-lg font-bold">요청하신 활동보고서를 찾을 수 없습니다.</p>
            <div className="flex gap-2">
                <Button variant="outline" onClick={handleBack}>
                    뒤로가기
                </Button>
                {clubId ? (
                    <Button asChild>
                        <Link href={`/clubs/${clubId}`}>동아리로 돌아가기</Link>
                    </Button>
                ) : null}
            </div>
        </div>
    );
}

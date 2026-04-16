"use client";

import { Button } from "@dongle/ui/button";
import { Search, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function NotFound() {
    const params = useParams<{ clubId: string }>();
    const clubId = params?.clubId;

    return (
        <div className="flex items-center justify-center p-4 md:p-16">
            <div className="w-full max-w-sm text-center space-y-6">
                {/* 아이콘 */}
                <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                    <Search className="w-6 h-6 text-muted-foreground" />
                </div>

                {/* 제목 */}
                <div className="space-y-2">
                    <h1 className="text-xl font-semibold text-foreground">페이지를 찾을 수 없습니다</h1>
                    <p className="text-sm text-muted-foreground">
                        요청하신 동아리 정보 수정 페이지가 존재하지 않습니다
                    </p>
                </div>

                {/* 버튼 */}
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => window.history.back()}>
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        뒤로가기
                    </Button>
                    {clubId ? (
                        <Button size="sm" className="flex-1" asChild>
                            <Link href={`/${clubId}/report`}>보고서 목록</Link>
                        </Button>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

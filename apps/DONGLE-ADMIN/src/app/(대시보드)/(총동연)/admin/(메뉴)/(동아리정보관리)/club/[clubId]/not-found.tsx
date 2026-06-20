"use client";

import { Button } from "@dongle/ui/button";
import { ArrowLeft, Search } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
    return (
        <div className="flex items-center justify-center p-4 md:p-16">
            <div className="w-full max-w-sm text-center space-y-6">
                <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                    <Search className="w-6 h-6 text-muted-foreground" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-xl font-semibold text-foreground">동아리를 찾을 수 없습니다</h1>
                    <p className="text-sm text-muted-foreground">요청하신 동아리가 존재하지 않거나 삭제되었습니다.</p>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => window.history.back()}>
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        뒤로가기
                    </Button>
                    <Button size="sm" className="flex-1" asChild>
                        <Link href="/admin/club">동아리 목록</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}

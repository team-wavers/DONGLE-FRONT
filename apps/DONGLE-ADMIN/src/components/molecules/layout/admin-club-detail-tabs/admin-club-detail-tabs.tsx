"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@dongle/ui/tabs";

interface AdminClubDetailTabsProps {
    clubId: string;
}

export default function AdminClubDetailTabs({ clubId }: AdminClubDetailTabsProps) {
    const pathname = usePathname();
    const activeTab = pathname.includes("/report") ? "report" : "info";

    return (
        <Tabs value={activeTab} className="w-full">
            <TabsList className="h-auto w-full max-w-lg rounded-2xl bg-zinc-100 p-1">
                <TabsTrigger
                    value="info"
                    asChild
                    className="min-h-11 rounded-xl text-sm font-semibold text-zinc-600 data-[state=active]:text-zinc-950 md:text-base">
                    <Link href={`/admin/club/${clubId}`}>동아리 정보관리</Link>
                </TabsTrigger>
                <TabsTrigger
                    value="report"
                    asChild
                    className="min-h-11 rounded-xl text-sm font-semibold text-zinc-600 data-[state=active]:text-zinc-950 md:text-base">
                    <Link href={`/admin/club/${clubId}/report`}>활동보고서 관리</Link>
                </TabsTrigger>
            </TabsList>
        </Tabs>
    );
}

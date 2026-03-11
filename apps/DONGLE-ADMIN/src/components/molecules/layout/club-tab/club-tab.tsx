"use client";

import { Tabs, TabsList, TabsTrigger } from "@dongle/ui/tabs";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

export default function ClubTab() {
  const pathname = usePathname();
  const params = useParams();

  const clubId = params["clubId"] as string;
  const activeTab = pathname.includes("/report") ? "report" : "club-form";

  return (
    <Tabs value={activeTab} className="w-full">
      <TabsList className="w-full max-w-3xl">
        <TabsTrigger
          value="club-form"
          className="md:text-base text-sm font-bold"
        >
          <Link href={`/${clubId}/club-form`}>동아리 정보 관리</Link>
        </TabsTrigger>
        <TabsTrigger value="report" className="md:text-base text-sm font-bold">
          <Link href={`/${clubId}/report`}>활동 보고서</Link>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

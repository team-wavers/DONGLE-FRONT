"use client";

import { Tabs, TabsList, TabsTrigger } from "@dongle/ui/tabs";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function ClubTab() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("club");
  const params = useParams();

  const clubId = params["clubId"] as string;

  useEffect(() => {
    if (pathname.includes("/club-form")) {
      setActiveTab("club-form");
    } else if (pathname.includes("/report")) {
      setActiveTab("report");
    }
  }, [pathname]);

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

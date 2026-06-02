"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@dongle/ui/tabs";
import React from "react";
import type { ReactNode } from "react";
import ClubIntroTabContent from "./club-intro-tab-content";
import { trackDongleEvent } from "@/lib/analytics";

type ClubDetailIntroViewModel = {
    description: string;
    main_activities: string;
};

interface ClubDetailTabsProps {
    club: ClubDetailIntroViewModel;
    clubId: string;
    clubName: string;
    reportsContent: ReactNode;
    schedulesContent: ReactNode;
}

const styles = {
    tabTrigger:
        "h-11 cursor-pointer rounded-none border-b-2 border-transparent text-base font-semibold text-zinc-500 transition-colors hover:text-zinc-800 focus-visible:text-zinc-800 data-[state=active]:border-b-zinc-950 data-[state=active]:bg-transparent data-[state=active]:text-zinc-950 data-[state=active]:shadow-none",
    tabContent: "pt-8",
} as const;

export default function ClubDetailTabs({
    club,
    clubId,
    clubName,
    reportsContent,
    schedulesContent,
}: ClubDetailTabsProps) {
    return (
        <Tabs
            defaultValue="intro"
            className="w-full"
            onValueChange={(value) =>
                trackDongleEvent("club_tab_change", {
                    club_id: Number(clubId),
                    club_name: clubName,
                    tab_name: value as "intro" | "reports" | "schedules",
                })
            }
        >
            <TabsList className="w-full grid grid-cols-3 h-11 rounded-none bg-transparent p-0 border-b border-zinc-200">
                <TabsTrigger value="intro" className={styles.tabTrigger}>
                    동아리 소개
                </TabsTrigger>
                <TabsTrigger value="reports" className={styles.tabTrigger}>
                    동아리 활동보고서
                </TabsTrigger>
                <TabsTrigger value="schedules" className={styles.tabTrigger}>
                    일정
                </TabsTrigger>
            </TabsList>

            <TabsContent value="intro" className={styles.tabContent}>
                <ClubIntroTabContent club={club} />
            </TabsContent>

            <TabsContent value="reports" className={styles.tabContent}>
                {reportsContent}
            </TabsContent>

            <TabsContent value="schedules" className={styles.tabContent}>
                {schedulesContent}
            </TabsContent>
        </Tabs>
    );
}

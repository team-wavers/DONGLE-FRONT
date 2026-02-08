"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@dongle/ui";
import type { Club } from "@dongle/types/club/club";
import type { ClubReport } from "@dongle/types/club/club.report";
import ClubIntroTabContent from "./club-intro-tab-content";
import ClubReportsTabContent from "./club-reports-tab-content";

interface ClubDetailTabsProps {
    club: Club;
    reports: ClubReport[];
}

const styles = {
    tabTrigger:
        "h-11 rounded-none border-b-2 border-transparent text-base font-semibold data-[state=active]:text-primary data-[state=active]:border-b-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent",
    tabContent: "pt-8",
} as const;

export default function ClubDetailTabs({ club, reports }: ClubDetailTabsProps) {
    return (
        <Tabs defaultValue="intro" className="w-full">
            <TabsList className="w-full grid grid-cols-2 h-11 rounded-none bg-transparent p-0 border-b border-zinc-200">
                <TabsTrigger value="intro" className={styles.tabTrigger}>
                    동아리 소개
                </TabsTrigger>
                <TabsTrigger value="reports" className={styles.tabTrigger}>
                    동아리 활동보고서
                </TabsTrigger>
            </TabsList>

            <TabsContent value="intro" className={styles.tabContent}>
                <ClubIntroTabContent club={club} />
            </TabsContent>

            <TabsContent value="reports" className={styles.tabContent}>
                <ClubReportsTabContent reports={reports} />
            </TabsContent>
        </Tabs>
    );
}

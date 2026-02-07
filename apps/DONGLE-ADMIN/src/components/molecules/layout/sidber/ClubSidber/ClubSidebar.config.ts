import { Building2, FileText, Key } from "lucide-react";

export interface ClubSidebarMenuConfig {
    name: string;
    href: string;
    icon: typeof Building2;
}

export const createClubMenuConfig = (clubId: string): Record<string, ClubSidebarMenuConfig> => ({
    clubForm: {
        name: "동아리 정보 관리",
        href: `/${clubId}/club-form`,
        icon: Building2,
    },
    report: {
        name: "활동 보고서",
        href: `/${clubId}/report`,
        icon: FileText,
    },
    account: {
        name: "계정 정보 관리",
        href: `/${clubId}/account`,
        icon: Key,
    },
});

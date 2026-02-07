import { SidebarMenuButton, SidebarMenuItem } from "@dongle/ui/sidebar";
import SidberItem from "../sidberItem";
import LogoutButton from "../../header/logout-button";
import { getAccessTokenFromServerCookie } from "@dongle/api/utils/cookie/server-cookie.util";
import SidebarLayout from "../sidebar-layout";
import { createClubMenuConfig } from "./ClubSidebar.config";

interface ClubSidebarProps {
    clubId: string;
    clubName?: string;
}

export default async function ClubSideber({ clubId, clubName }: ClubSidebarProps) {
    const accessToken = await getAccessTokenFromServerCookie();
    const MENU_CONFIG = createClubMenuConfig(clubId);

    const header = (
        <div className="flex items-center px-2">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-zinc-900">{clubName || "동아리"}</h1>
                <p className="text-lg font-semibold text-muted-foreground">회장</p>
            </div>
        </div>
    );

    const menu = Object.values(MENU_CONFIG).map((item) => (
        <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild>
                <SidberItem href={item.href}>
                    {item.icon && <item.icon className="w-4 h-4" />}
                    {item.name}
                </SidberItem>
            </SidebarMenuButton>
        </SidebarMenuItem>
    ));

    const footer = <LogoutButton accessToken={accessToken ?? null} />;

    return <SidebarLayout header={header} menu={menu} footer={footer} />;
}

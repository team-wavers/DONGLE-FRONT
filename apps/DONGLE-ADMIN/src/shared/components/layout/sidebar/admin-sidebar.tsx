import { MENU_CONFIG } from "./admin-sidebar.config";
import { SidebarMenuButton, SidebarMenuItem } from "@dongle/ui/sidebar";
import SidebarItem from "./sidebar-item";
import LogoutButton from "@/feature/auth/components/logout-button";
import { getAccessTokenFromServerCookie } from "@dongle/api/utils/cookie/server-cookie.util";
import SidebarLayout from "./sidebar-layout";

export default async function AdminSidebar() {
    const accessToken = await getAccessTokenFromServerCookie();

    const header = (
        <div className="flex items-center">
            <div className="flex flex-col gap-2">
                <h1 className="text-xl font-bold text-zinc-900">총동아리연합회</h1>
                <p className="text-base font-semibold text-muted-foreground">관리자</p>
            </div>
        </div>
    );

    const menu = Object.values(MENU_CONFIG).map((item) => (
        <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild>
                <SidebarItem href={item.href}>
                    {item.icon && <item.icon className="w-4 h-4" />}
                    {item.name}
                </SidebarItem>
            </SidebarMenuButton>
        </SidebarMenuItem>
    ));

    const footer = <LogoutButton accessToken={accessToken ?? null} />;

    return <SidebarLayout header={header} menu={menu} footer={footer} />;
}

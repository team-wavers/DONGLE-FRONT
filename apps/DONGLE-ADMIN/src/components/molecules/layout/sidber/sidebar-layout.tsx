import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarFooter,
} from "@dongle/ui/sidebar";
import { ReactNode } from "react";

interface SidebarLayoutProps {
    header: ReactNode;
    menu: ReactNode;
    footer?: ReactNode;
    className?: string;
    headerClassName?: string;
    contentClassName?: string;
    footerClassName?: string;
}

export default function SidebarLayout({
    header,
    menu,
    footer,
    className,
    headerClassName,
    contentClassName,
    footerClassName,
}: SidebarLayoutProps) {
    return (
        <Sidebar variant="sidebar" className={className || "bg-white"}>
            <SidebarHeader
                className={
                    headerClassName || "border-b border-border p-4 py-8 h-32 flex flex-col justify-center bg-white"
                }>
                {header}
            </SidebarHeader>
            <SidebarContent className={contentClassName || "pt-8 bg-white"}>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>{menu}</SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            {footer && (
                <SidebarFooter className={footerClassName || "p-4 py-8 bg-white border-t border-border"}>
                    {footer}
                </SidebarFooter>
            )}
        </Sidebar>
    );
}

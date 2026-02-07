"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@dongle/ui/sidebar";
import { useIsMobile } from "@dongle/ui/hooks/use-mobile";
import { cn } from "@dongle/ui/utils";

/**
 * 모바일에서만 표시되는 사이드바 열기 버튼.
 * /admin 또는 /[clubId] 하위 경로에서만 렌더링합니다.
 */
export default function HeaderSidebarTrigger({ className }: { className?: string }) {
    const pathname = usePathname();
    const isMobile = useIsMobile();

    const isSidebarRoute = pathname.startsWith("/admin") || /^\/\d+(\/|$)/.test(pathname); // /123 or /123/club-form

    if (!isMobile || !isSidebarRoute) {
        return null;
    }

    return (
        <div className={cn("absolute left-3 top-1/2 -translate-y-1/2 z-20", className)}>
            <SidebarTrigger aria-label="메뉴 열기" />
        </div>
    );
}

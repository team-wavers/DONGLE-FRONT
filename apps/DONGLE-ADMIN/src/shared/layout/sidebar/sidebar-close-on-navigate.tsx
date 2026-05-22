"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSidebar } from "@dongle/ui/sidebar";

/**
 * 라우트 변경 시 모바일 사이드바(Sheet)를 닫습니다. UI는 렌더하지 않습니다.
 */
export default function SidebarCloseOnNavigate() {
    const pathname = usePathname();
    const { setOpenMobile } = useSidebar();

    useEffect(() => {
        setOpenMobile(false);
    }, [pathname, setOpenMobile]);

    return null;
}

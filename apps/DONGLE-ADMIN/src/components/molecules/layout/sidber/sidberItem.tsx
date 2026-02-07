"use client";

import { LoadingButton } from "@/components/atoms/button/loading-button/loading-button";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function SidberItem({ children, href }: { children: React.ReactNode; href: string }) {
    const pathname = usePathname();

    const isActive = (() => {
        // 정확히 일치하는 경우
        if (pathname === href) {
            return true;
        }

        if (href === "/admin") {
            return pathname === "/admin";
        }

        // 다른 경로들은 해당 경로로 시작하면 활성화
        return pathname.startsWith(href + "/") || pathname === href;
    })();

    return (
        <Link href={href} className="flex items-center gap-2 cursor-pointer w-full">
            <LoadingButton variant={isActive ? "default" : "ghost"} className="w-full">
                {children}
            </LoadingButton>
        </Link>
    );
}

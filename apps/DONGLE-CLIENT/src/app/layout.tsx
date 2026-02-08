import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { AppHeader } from "@dongle/ui";
import "./globals.css";

export const metadata: Metadata = {
    title: "동글",
    description: "우리의 동아리, 우리의 동글",
    icons: {
        icon: "/favicon.ico",
        apple: "/favicon.ico",
    },
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="ko">
            <body className="min-h-screen bg-white text-zinc-900">
                <div className="min-h-screen flex flex-col pb-64">
                    <AppHeader
                        center={
                            <Link href="/" aria-label="홈으로 이동">
                                <Image src="/logo/logo-icon.svg" alt="dongle-logo" width={100} height={100} priority />
                            </Link>
                        }
                    />
                    <main className="flex-1 w-full max-w-[1024px] mx-auto px-6">{children}</main>
                </div>
                <footer className="border-t border-zinc-200 bg-zinc-50">
                    <div className="w-full max-w-[1024px] mx-auto px-6 py-6 text-xs text-zinc-500 space-y-1">
                        <p>&copy; {new Date().getFullYear()} DONGLE.</p>
                        <p>All rights reserved.</p>
                    </div>
                </footer>
            </body>
        </html>
    );
}

import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { AppHeader } from "@dongle/ui";
import "./globals.css";

const siteUrl = "https://dongle.wavers.kr";
const siteTitle = "동글";
const siteDescription = "우리의 동아리, 우리의 동글";
const defaultOgImage = "/logo/logo-full.svg";

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: {
        default: siteTitle,
        template: "%s | 동글",
    },
    description: siteDescription,
    alternates: {
        canonical: "/",
    },
    openGraph: {
        title: siteTitle,
        description: siteDescription,
        url: siteUrl,
        siteName: siteTitle,
        locale: "ko_KR",
        type: "website",
        images: [
            {
                url: defaultOgImage,
                alt: "동글 로고",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: siteTitle,
        description: siteDescription,
        images: [defaultOgImage],
    },
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

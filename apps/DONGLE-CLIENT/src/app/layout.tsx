import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import HeaderScheduleLink from "@/components/navigation/header-schedule-link";
import SiteJsonLd from "@/components/seo/site-json-ld";
import { DEFAULT_OG_IMAGE_PATH, SITE_DESCRIPTION, SITE_HOME_TITLE, SITE_TITLE, SITE_URL } from "@/lib/site";
import { AppHeader } from "@dongle/ui/headers/app-header";
import "./globals.css";

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: SITE_TITLE,
        template: "%s | 동글",
    },
    description: SITE_DESCRIPTION,
    alternates: {
        canonical: "/",
    },
    openGraph: {
        title: SITE_HOME_TITLE,
        description: SITE_DESCRIPTION,
        url: SITE_URL,
        siteName: SITE_TITLE,
        locale: "ko_KR",
        type: "website",
        images: [
            {
                url: DEFAULT_OG_IMAGE_PATH,
                alt: "동글 로고",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: SITE_HOME_TITLE,
        description: SITE_DESCRIPTION,
        images: [DEFAULT_OG_IMAGE_PATH],
    },
    icons: {
        icon: "/favicon.ico",
        apple: "/favicon.ico",
    },
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="ko">
            <head>
                <SiteJsonLd />
            </head>
            <body className="min-h-screen bg-white text-zinc-900">
                <div className="min-h-screen flex flex-col pb-64">
                    <AppHeader
                        contentClassName="mx-auto max-w-[1024px]"
                        center={
                            <Link href="/" aria-label="홈으로 이동">
                                <Image src="/logo/logo-icon.svg" alt="dongle-logo" width={100} height={100} priority />
                            </Link>
                        }
                        right={<HeaderScheduleLink />}
                        rightClassName="right-6"
                    />
                    <main className="flex-1 w-full max-w-[1024px] mx-auto px-6">{children}</main>
                </div>
                <footer className="border-t border-zinc-200 bg-zinc-50">
                    <div className="w-full max-w-[1024px] mx-auto px-6 py-6 text-xs text-zinc-500 space-y-2">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <p>&copy; {new Date().getFullYear()} DONGLE.</p>
                            <Link href="/privacy" className="font-medium text-zinc-600 hover:text-zinc-900">
                                개인정보처리방침
                            </Link>
                        </div>
                        <p>All rights reserved.</p>
                    </div>
                </footer>
            </body>
        </html>
    );
}

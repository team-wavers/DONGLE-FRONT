import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";
import { Toaster } from "@dongle/ui/toaster";
import Footer from "@/components/molecules/layout/footer/footer";
import { GlobalErrorHandler } from "@/components/providers/global-error-handler";

const pretendard = localFont({
    src: "../assets/fonts/PretendardVariable.woff2",
    variable: "--font-pretendard",
});

export const metadata: Metadata = {
    title: "동글 관리자",
    description: "동글 관리자",
    icons: {
        icon: "/favicon.ico",
        apple: "/favicon.ico",
    },
};

export const viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ko">
            <body className={`${pretendard.variable} antialiased`}>
                <GlobalErrorHandler />
                <div className="flex flex-col min-h-screen h-full w-full justify-between items-center">
                    <div className="flex justify-center items-center w-full h-full flex-1 mb-32">{children}</div>
                    <Footer />
                </div>
                <Toaster />
            </body>
        </html>
    );
}

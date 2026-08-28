import { Suspense } from "react";
import AdminSidebar from "@/shared/layout/sidebar/admin-sidebar";
import SidebarCloseOnNavigate from "@/shared/layout/sidebar/sidebar-close-on-navigate";
import { Skeleton } from "@dongle/ui/skeleton";
import { SidebarInset } from "@dongle/ui/sidebar";

function AdminSidebarFallback() {
    return (
        <>
            {/* 실제 사이드바는 자체 gap div로 공간을 확보하지만, 고정 스켈레톤 박스는 그렇지 않다 */}
            <div className="hidden md:block w-3xs shrink-0" />
            <div className="hidden md:flex fixed inset-y-0 left-0 z-10 h-svh w-3xs border-r bg-white">
                <div className="flex w-full flex-col">
                    <div className="border-b border-border px-4 py-5 min-h-24 flex flex-col justify-center">
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="mt-2 h-5 w-12" />
                    </div>
                    <div className="flex-1 p-4 pt-4">
                        <div className="space-y-4">
                            <Skeleton className="h-8 w-full" />
                            <Skeleton className="h-8 w-full" />
                            <Skeleton className="h-8 w-full" />
                        </div>
                    </div>
                    <div className="border-t border-border px-4 py-5">
                        <Skeleton className="h-8 w-full" />
                    </div>
                </div>
            </div>
        </>
    );
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Suspense fallback={<AdminSidebarFallback />}>
                <AdminSidebar />
            </Suspense>
            <SidebarInset className="flex flex-col justify-start items-center min-h-screen h-full gap-6">
                <SidebarCloseOnNavigate />
                <div className="flex justify-center items-start max-w-7xl w-full h-full px-6 py-6 md:px-8 md:py-10">
                    {children}
                </div>
            </SidebarInset>
        </>
    );
}

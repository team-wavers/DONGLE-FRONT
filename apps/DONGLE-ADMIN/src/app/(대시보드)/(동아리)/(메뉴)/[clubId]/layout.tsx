import { Suspense } from "react";
import ClubSideber from "@/components/molecules/layout/sidber/ClubSidber/ClubSideber";
import SidebarCloseOnNavigate from "@/components/molecules/layout/sidber/sidebar-close-on-navigate";
import { getClubService } from "@/lib/server/cached-services";
import { Skeleton } from "@dongle/ui/skeleton";
import { SidebarInset } from "@dongle/ui/sidebar";
import NotFound from "./not-found";

async function ClubSidebarAsync({ clubId }: { clubId: string }) {
    const { result } = await getClubService(Number(clubId));

    return <ClubSideber clubId={clubId} clubName={result?.name} />;
}

function ClubSidebarFallback() {
    return (
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
    );
}

export default async function ClubLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ clubId: string }>;
}) {
    const { clubId } = await params;

    const clubIdNum = Number(clubId);
    if (!clubId || clubId === "undefined" || isNaN(clubIdNum) || clubIdNum <= 0) {
        return <NotFound />;
    }

    return (
        <>
            <Suspense fallback={<ClubSidebarFallback />}>
                <ClubSidebarAsync clubId={clubId} />
            </Suspense>
            <SidebarInset className="flex flex-col justify-start items-center min-h-screen w-full gap-6">
                <SidebarCloseOnNavigate />
                <div className="flex justify-center items-start max-w-7xl w-full px-6 py-6 md:px-8 md:py-10">
                    {children}
                </div>
            </SidebarInset>
        </>
    );
}

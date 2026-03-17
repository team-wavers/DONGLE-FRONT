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
                <div className="border-b border-border p-4 py-8 h-32 flex flex-col justify-center">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="mt-2 h-5 w-12" />
                </div>
                <div className="flex-1 p-4 pt-8">
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                    </div>
                </div>
                <div className="border-t border-border p-4 py-8">
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
            <SidebarInset className="flex flex-col justify-start items-center min-h-screen w-full gap-8">
                <SidebarCloseOnNavigate />
                <div className="flex justify-center items-start max-w-5xl w-full md:py-24 py-16 px-8">{children}</div>
            </SidebarInset>
        </>
    );
}

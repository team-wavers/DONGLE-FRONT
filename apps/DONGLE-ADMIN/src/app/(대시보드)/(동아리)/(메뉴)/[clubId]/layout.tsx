import ClubSideber from "@/components/molecules/layout/sidber/ClubSidber/ClubSideber";
import SidebarCloseOnNavigate from "@/components/molecules/layout/sidber/sidebar-close-on-navigate";
import { SidebarInset } from "@dongle/ui/sidebar";
import { getClubService } from "@dongle/service/club/club.service";
import NotFound from "./not-found";

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

    const { result } = await getClubService(clubIdNum);

    return (
        <>
            <ClubSideber clubId={clubId} clubName={result?.name} />
            <SidebarInset className="flex flex-col justify-center items-center min-h-screen w-full gap-8">
                <SidebarCloseOnNavigate />
                <div className="flex justify-center items-start max-w-3xl w-full md:py-24 py-16 px-8">{children}</div>
            </SidebarInset>
        </>
    );
}

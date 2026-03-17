import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@dongle/ui/button";
import { Skeleton } from "@dongle/ui/skeleton";
import AdminClubDetailTabs from "@/components/molecules/layout/admin-club-detail-tabs/admin-club-detail-tabs";
import { getClubService } from "@/lib/server/cached-services";

async function AdminClubDetailHeader({ clubId }: { clubId: string }) {
    const { result, isSuccess } = await getClubService(Number(clubId));
    const clubName = isSuccess && result ? result.name : `동아리 #${clubId}`;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center">
                <Link href="/admin/club">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        목록으로
                    </Button>
                </Link>
            </div>

            <div className="flex flex-col gap-3">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-950">{clubName}</h1>
                    <p className="text-sm leading-6 text-muted-foreground">
                        동아리 정보와 활동보고서를 간결하게 관리할 수 있습니다.
                    </p>
                </div>
            </div>
        </div>
    );
}

function AdminClubDetailHeaderFallback() {
    return (
        <div className="flex flex-col gap-4">
            <Skeleton className="h-9 w-24 rounded-md" />
            <div className="flex flex-col gap-3">
                <Skeleton className="h-10 w-72" />
                <Skeleton className="h-4 w-full max-w-xl" />
            </div>
        </div>
    );
}

export default async function AdminClubDetailLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ clubId: string }>;
}) {
    const { clubId } = await params;

    return (
        <div className="flex flex-col w-full gap-6">
            <Suspense fallback={<AdminClubDetailHeaderFallback />}>
                <AdminClubDetailHeader clubId={clubId} />
            </Suspense>
            <AdminClubDetailTabs clubId={clubId} />
            <div className="flex w-full justify-start py-2">{children}</div>
        </div>
    );
}

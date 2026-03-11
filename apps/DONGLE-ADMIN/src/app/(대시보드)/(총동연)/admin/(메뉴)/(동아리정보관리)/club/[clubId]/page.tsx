import { Suspense } from "react";
import { getClubService } from "@/lib/server/cached-services";
import { Button } from "@dongle/ui/button";
import { Skeleton } from "@dongle/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import ClubForm from "@/feature/club/components/club-form/club-form";
import Link from "next/link";

async function ClubDetailContent({ clubId }: { clubId: string }) {
    const { result, isSuccess } = await getClubService(Number(clubId));

    if (!isSuccess || !result) {
        return (
            <div className="flex flex-col items-center justify-center py-8">
                <p className="text-red-500 mb-4">동아리 정보를 불러오는데 실패했습니다.</p>
                <Link href="/admin/club">
                    <Button variant="outline">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        돌아가기
                    </Button>
                </Link>
            </div>
        );
    }

    const presidentId = result.president?.id;

    return (
        <div className="flex flex-col w-full gap-4">
            <ClubForm club={result} clubId={clubId} presidentId={presidentId} />
        </div>
    );
}

function ClubDetailFallback() {
    return (
        <div className="flex flex-col w-full gap-4">
            <Skeleton className="h-96 w-full rounded-2xl" />
            <Skeleton className="h-72 w-full rounded-2xl" />
        </div>
    );
}

export default async function ClubDetailPage({ params }: { params: Promise<{ clubId: string }> }) {
    const { clubId } = await params;

    return (
        <div className="flex flex-col w-full gap-4">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/admin/club">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        돌아가기
                    </Button>
                </Link>
            </div>
            <Suspense fallback={<ClubDetailFallback />}>
                <ClubDetailContent clubId={clubId} />
            </Suspense>
        </div>
    );
}

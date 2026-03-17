import { Suspense } from "react";
import ClubForm from "@/feature/club/components/club-form/club-form";
import { getClubService } from "@/lib/server/cached-services";
import { Skeleton } from "@dongle/ui/skeleton";
import NotFound from "./not-found";

async function ClubFormContent({ clubId }: { clubId: string }) {
    const { result, isSuccess } = await getClubService(Number(clubId));
    if (!result || !isSuccess || !result.president?.id) {
        return <NotFound />;
    }

    return (
        <div className="flex flex-col gap-8 w-full">
            <ClubForm club={result} clubId={clubId} presidentId={result.president.id} />
        </div>
    );
}

function ClubFormFallback() {
    return (
        <div className="flex flex-col gap-8 w-full">
            <Skeleton className="h-[36rem] w-full rounded-2xl" />
            <Skeleton className="h-80 w-full rounded-2xl" />
        </div>
    );
}

export default async function Page({ params }: { params: Promise<{ clubId: string }> }) {
    const { clubId } = await params;

    return (
        <Suspense fallback={<ClubFormFallback />}>
            <ClubFormContent clubId={clubId} />
        </Suspense>
    );
}

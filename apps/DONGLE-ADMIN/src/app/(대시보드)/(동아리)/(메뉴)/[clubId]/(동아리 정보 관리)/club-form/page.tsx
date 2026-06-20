import ClubForm from "@/feature/club/components/club-form/club-form";
import { getClubService } from "@/lib/server/cached-services";
import { notFound } from "next/navigation";
import NotFound from "./not-found";

async function ClubFormContent({ clubId }: { clubId: string }) {
    const { result, isSuccess, error } = await getClubService(Number(clubId));

    if (!isSuccess) {
        if (error.status === 404) {
            notFound();
        }

        throw new Error("동아리 정보를 불러오는데 실패했습니다.");
    }

    if (!result || !result.president?.id) {
        return <NotFound />;
    }

    return (
        <div className="flex flex-col gap-8 w-full">
            <ClubForm club={result} clubId={clubId} presidentId={result.president.id} />
        </div>
    );
}

export default async function Page({ params }: { params: Promise<{ clubId: string }> }) {
    const { clubId } = await params;

    return <ClubFormContent clubId={clubId} />;
}

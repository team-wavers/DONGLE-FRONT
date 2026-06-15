import { getClubService } from "@/lib/server/cached-services";
import ClubForm from "@/feature/club/components/club-form/club-form";

async function ClubDetailContent({ clubId }: { clubId: string }) {
    const { result, isSuccess } = await getClubService(Number(clubId));

    if (!isSuccess || !result) {
        return (
            <div className="flex flex-col items-center justify-center py-8">
                <p className="text-red-500">동아리 정보를 불러오는데 실패했습니다.</p>
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

export default async function ClubDetailPage({ params }: { params: Promise<{ clubId: string }> }) {
    const { clubId } = await params;

    return <ClubDetailContent clubId={clubId} />;
}

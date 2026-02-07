import ClubForm from "@/feature/club/components/club-form/club-form";
import { getClubService } from "@dongle/service/club/club.service";
import NotFound from "./not-found";

export default async function Page({ params }: { params: Promise<{ clubId: string }> }) {
    const { clubId } = await params;

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

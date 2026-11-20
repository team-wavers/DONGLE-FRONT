import { getClubService } from "@/lib/server/cached-services";
import ClubForm from "@/feature/club/components/club-form/club-form";
import { notFound } from "next/navigation";
import { requireAdminPageAccess } from "@/shared/action/server-page-auth";

async function ClubDetailContent({ clubId }: { clubId: string }) {
    await requireAdminPageAccess({ clubId });
    const { result, isSuccess, error } = await getClubService(Number(clubId));

    if (!isSuccess) {
        if (error.status === 404) {
            notFound();
        }

        throw new Error("동아리 정보를 불러오는데 실패했습니다.");
    }

    if (!result) {
        return (
            <div className="flex flex-col items-center justify-center py-8">
                <p className="text-red-500">동아리 정보를 불러오는데 실패했습니다.</p>
            </div>
        );
    }

    const presidentId = result.president?.id;
    const clubForForm = {
        ...result,
        president: result.president
            ? { id: result.president.id, name: result.president.name, phone: result.president.phone }
            : result.president,
    };

    return (
        <div className="flex flex-col w-full gap-4">
            <ClubForm club={clubForForm} clubId={clubId} presidentId={presidentId} />
        </div>
    );
}

export default async function ClubDetailPage({ params }: { params: Promise<{ clubId: string }> }) {
    const { clubId } = await params;

    return <ClubDetailContent clubId={clubId} />;
}

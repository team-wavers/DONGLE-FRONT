import type { Club } from "@dongle/types/club/club.d";
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

    // ponytail: 폼이 읽지 않는 감사용 타임스탬프는 client RSC payload에서 제외한다.
    // Club 타입에 폼이 쓰는 필드가 추가되면 이 목록도 같이 넓혀야 한다.
    const { created_at: _createdAt, updated_at: _updatedAt, deleted_at: _deletedAt, ...clubFormFields } = result;

    return (
        <div className="flex flex-col gap-8 w-full">
            <ClubForm club={clubFormFields as Club} clubId={clubId} presidentId={result.president.id} />
        </div>
    );
}

export default async function Page({ params }: { params: Promise<{ clubId: string }> }) {
    const { clubId } = await params;

    return <ClubFormContent clubId={clubId} />;
}

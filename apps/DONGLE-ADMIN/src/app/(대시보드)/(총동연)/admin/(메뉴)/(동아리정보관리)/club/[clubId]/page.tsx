import { getClubService } from "@dongle/service/club/club.service";
import { Button } from "@dongle/ui/button";
import { ArrowLeft } from "lucide-react";
import ClubForm from "@/feature/club/components/club-form/club-form";
import Link from "next/link";

export default async function ClubDetailPage({ params }: { params: Promise<{ clubId: string }> }) {
    const { clubId } = await params;
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
            <div className="flex items-center gap-4 mb-6">
                <Link href="/admin/club">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        돌아가기
                    </Button>
                </Link>
            </div>
            <ClubForm club={result} clubId={clubId} presidentId={presidentId} />
        </div>
    );
}

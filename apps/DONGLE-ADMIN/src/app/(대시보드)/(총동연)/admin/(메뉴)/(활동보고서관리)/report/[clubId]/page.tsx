import ReportCard from "@/feature/report/components/report-card/report-card";
import { getClubReportListService } from "@dongle/service/club/club.report.service";
import Link from "next/link";
import { Button } from "@dongle/ui/button";
import { ClubReport } from "@dongle/types/club/club.report.d";

export default async function AdminReportPage({ params }: { params: Promise<{ clubId: string }> }) {
    const { clubId } = await params;

    const { result, isSuccess } = await getClubReportListService(Number(clubId));

    if (!isSuccess || !result) {
        throw new Error("활동 보고서를 가져오는데 실패했습니다.");
    }

    if (result.length === 0) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="text-zinc-500">등록된 활동 보고서가 없습니다.</div>
            </div>
        );
    }

    return (
        <div className="relative flex flex-col gap-4 w-full justify-center items-center max-w-4xl">
            <div className="w-full">
                <div className="md:sticky top-20 left-0 translate-x-0 translate-y-0 lg:translate-y-12">
                    <Link href={`/admin/report`}>
                        <Button variant="outline" size="sm">
                            ← 목록으로
                        </Button>
                    </Link>
                </div>
            </div>
            <div className="flex flex-col gap-4 w-full justify-center items-center">
                {result.map((report: ClubReport) => (
                    <ReportCard
                        key={report.id}
                        href={`/admin/report/${clubId}/${report.id}`}
                        title={report.title}
                        createdDate={report.createdAt}
                    />
                ))}
            </div>
        </div>
    );
}

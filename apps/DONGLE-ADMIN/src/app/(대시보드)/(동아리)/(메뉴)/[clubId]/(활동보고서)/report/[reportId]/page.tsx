import { getClubReportFromListService } from "@dongle/service/club/club.report.service";
import ReportView from "@/components/molecules/layout/report-view/report-view";
import Link from "next/link";
import { Button } from "@dongle/ui/button";
import { Pencil } from "lucide-react";
import DeleteReportButton from "@/feature/report/components/delete-report-button";

export default async function Page({ params }: { params: Promise<{ clubId: string; reportId: string }> }) {
    const { clubId, reportId } = await params;

    // 캐시된 목록에서 특정 보고서 찾기
    const { result } = await getClubReportFromListService(Number(clubId), Number(reportId));

    if (!result) {
        return <div className="flex justify-center items-center py-16 text-zinc-500">활동 보고서가 없습니다.</div>;
    }

    return (
        <div className="flex flex-col gap-4 w-full">
            <ReportView report={result} backHref={`/${clubId}/report`} backButtonText="목록으로 돌아가기" />
            <div className="mt-4 flex justify-end gap-3 border-t border-gray-200 pt-4">
                <DeleteReportButton clubId={clubId} reportId={reportId} />
                <Link href={`/${clubId}/report/${reportId}/edit`}>
                    <Button className="bg-primary hover:bg-primary/90 text-white">
                        <Pencil className="w-4 h-4 mr-2" />
                        수정하기
                    </Button>
                </Link>
            </div>
        </div>
    );
}

import { getClubReportFromListService } from "@dongle/service/club/club.report.service";
import ReportView from "@/components/molecules/layout/report-view/report-view";

export default async function AdminReportDetailPage({
    params,
}: {
    params: Promise<{ reportId: string; clubId: string }>;
}) {
    const { reportId, clubId } = await params;

    // 캐시된 목록에서 특정 보고서 찾기
    const { result, isSuccess } = await getClubReportFromListService(Number(clubId), Number(reportId));

    if (!isSuccess) {
        throw new Error("활동보고서를 가져오는데 실패했습니다.");
    }

    if (!result) {
        return <div className="flex flex-col gap-4 w-full pt-16">활동 보고서가 없습니다.</div>;
    }

    return (
        <div className="flex flex-col gap-4 w-full">
            <div className="max-w-2xl mx-auto w-full py-12">
                <ReportView report={result} backHref={`/admin/report/${clubId}`} backButtonText="돌아가기" />
            </div>
        </div>
    );
}

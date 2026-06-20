import DeleteReportButton from "@/feature/report/components/delete-report-button";
import ReportView from "@/feature/report/components/report-view/report-view";
import { getClubReportService } from "@/lib/server/cached-services";
import { Button } from "@dongle/ui/button";
import { Pencil } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

async function ClubReportDetailContent({ clubId, reportId }: { clubId: string; reportId: string }) {
    const reportResponse = await getClubReportService(Number(clubId), Number(reportId));
    const { result, isSuccess, error } = reportResponse;

    if (!isSuccess) {
        if (error.status === 404) {
            notFound();
        }

        throw new Error("활동보고서를 가져오는데 실패했습니다.");
    }

    if (!result) {
        return <div className="flex justify-center items-center py-16 text-zinc-500">활동 보고서가 없습니다.</div>;
    }

    return (
        <div className="flex flex-col gap-4 w-full">
            <ReportView
                report={{
                    title: result.title,
                    content: result.content,
                    createdAt: result.createdAt,
                    image_urls: result.image_urls,
                }}
                backHref={`/${clubId}/report`}
                backButtonText="목록으로 돌아가기"
            />
            <div className="mt-4 flex justify-end gap-3 border-t border-gray-200 pt-4">
                <DeleteReportButton clubId={clubId} reportId={reportId} redirectHref={`/${clubId}/report`} />
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

export default async function Page({ params }: { params: Promise<{ clubId: string; reportId: string }> }) {
    const { clubId, reportId } = await params;

    return <ClubReportDetailContent clubId={clubId} reportId={reportId} />;
}

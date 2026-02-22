import ReportCard from "@/feature/report/components/report-card/report-card";
import { getClubReportListService } from "@dongle/service/club/club.report.service";
import Link from "next/link";
import { Button } from "@dongle/ui/button";
import { Pencil } from "lucide-react";
import { ClubReport } from "@dongle/types/club/club.report.d";

export default async function Page({ params }: { params: Promise<{ clubId: string }> }) {
    const { clubId } = await params;

    // 서버에서 데이터 가져오기
    const { result } = await getClubReportListService(Number(clubId));

    return (
        <div className="flex flex-col w-full items-center">
            <div className="flex justify-end w-full mb-4">
                <Link href="./create">
                    <Button className="font-semibold shadow-lg">
                        <Pencil className="w-4 h-4 mr-2" />
                        작성하기
                    </Button>
                </Link>
            </div>
            {result && result.length > 0 ? (
                <div className="flex flex-col gap-4 w-full justify-center items-center md:max-w-md pt-4">
                    {result.map((report: ClubReport) => (
                        <ReportCard
                            key={report.id}
                            title={report.title}
                            createdDate={report.createdAt}
                            content={report.content}
                            href={`/${clubId}/report/${report.id}`}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex justify-center items-center py-16">
                    <div className="text-gray-500">활동보고서가 없습니다.</div>
                </div>
            )}
        </div>
    );
}

import ActivityReportForm from "@/feature/report/components/activity-report-form/activity-report-form";
import GoBackButton from "@/components/atoms/button/go-back-button/go-back-button";

interface CreateReportPageProps {
    params: Promise<{
        clubId: string;
    }>;
}

export default async function CreateReportPage({ params }: CreateReportPageProps) {
    const { clubId } = await params;

    return (
        <div className="flex flex-col w-full items-center gap-4">
            <div className="pt-12 justify-start w-full">
                <GoBackButton />
            </div>
            <div className="w-full">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold mb-2">활동보고서 작성</h1>
                </div>
                <ActivityReportForm clubId={clubId} />
            </div>
        </div>
    );
}

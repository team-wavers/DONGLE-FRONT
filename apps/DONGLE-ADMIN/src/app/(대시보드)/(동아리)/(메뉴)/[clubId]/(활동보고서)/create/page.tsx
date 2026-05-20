import ActivityReportForm from "@/feature/report/components/activity-report-form/activity-report-form";

interface CreateReportPageProps {
    params: Promise<{
        clubId: string;
    }>;
}

export default async function CreateReportPage({ params }: CreateReportPageProps) {
    const { clubId } = await params;

    return (
        <ActivityReportForm
            clubId={clubId}
            successRedirectHref={`/${clubId}/report`}
            successMessage="활동 보고서가 성공적으로 등록되었습니다!"
            backHref={`/${clubId}/report`}
            headingTitle="활동보고서 작성"
            headingDescription="동아리 활동 내용을 등록합니다."
        />
    );
}

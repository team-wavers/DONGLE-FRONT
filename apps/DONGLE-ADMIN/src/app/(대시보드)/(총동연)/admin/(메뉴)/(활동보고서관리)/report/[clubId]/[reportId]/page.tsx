import { redirect } from "next/navigation";

export default async function AdminReportDetailPage({
    params,
}: {
    params: Promise<{ reportId: string; clubId: string }>;
}) {
    const { reportId, clubId } = await params;
    redirect(`/admin/club/${clubId}/report/${reportId}`);
}

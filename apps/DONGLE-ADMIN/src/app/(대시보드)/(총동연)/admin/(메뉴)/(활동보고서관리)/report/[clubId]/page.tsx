import { redirect } from "next/navigation";

export default async function AdminReportPage({ params }: { params: Promise<{ clubId: string }> }) {
    const { clubId } = await params;
    redirect(`/admin/club/${clubId}/report`);
}

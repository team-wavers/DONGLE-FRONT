import FilterableReportList from "@/feature/report/components/filterable-report-list/filterable-report-list";
import { loadClubReportListViewModel } from "./club-report-list-view-model";

async function ClubReportListSection({ clubId }: { clubId: string }) {
    const { reports, loadFailed } = await loadClubReportListViewModel(clubId);

    return <FilterableReportList reports={reports} clubId={clubId} loadFailed={loadFailed} />;
}

export default async function Page({ params }: { params: Promise<{ clubId: string }> }) {
    const { clubId } = await params;

    return (
        <div className="flex w-full flex-col gap-4">
            <ClubReportListSection clubId={clubId} />
        </div>
    );
}

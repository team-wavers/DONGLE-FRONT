import { getClubReportListService } from "@/lib/server/cached-services";
import { requireClubPageAccess } from "@/shared/action/server-page-auth";

export async function loadClubReportListViewModel(clubId: string) {
    await requireClubPageAccess({ clubId });
    try {
        const { result, isSuccess } = await getClubReportListService(Number(clubId));

        return {
            reports: isSuccess ? result || [] : [],
            loadFailed: !isSuccess,
        };
    } catch {
        return {
            reports: [],
            loadFailed: true,
        };
    }
}

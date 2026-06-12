import { getClubReportListService } from "@/lib/server/cached-services";

export async function loadClubReportListViewModel(clubId: string) {
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

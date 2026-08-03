import { getAdminDashboardService } from "@/lib/server/cached-services";
import type { DashboardData } from "@dongle/types/dashboard/dashboard";

const EMPTY_DASHBOARD_DATA: DashboardData = {
    clubs: { total: 0, recruiting: 0, recent: [] },
    users: { total: 0, recent: [] },
    banners: { total: 0, active: 0 },
    schedules: { thisMonth: 0 },
};

export async function getAdminHomeData(): Promise<{ isError: boolean } & DashboardData> {
    try {
        const response = await getAdminDashboardService();

        if (!response.isSuccess) {
            return { isError: true, ...EMPTY_DASHBOARD_DATA };
        }

        return { isError: false, ...response.result };
    } catch {
        return { isError: true, ...EMPTY_DASHBOARD_DATA };
    }
}

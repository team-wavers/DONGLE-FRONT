import FetchInstance from "@dongle/api/instance";
import type { FetchOptions } from "@dongle/api/fetch-types";
import type { DashboardResponse } from "@dongle/types/dashboard/dashboard.response";

const instance = FetchInstance.getInstance();

const DASHBOARD_PATH = "/dashboard";

function getAdminDashboardFetchOptions(): FetchOptions {
    return {
        cache: "no-store",
    };
}

export async function getAdminDashboardService(): Promise<DashboardResponse> {
    return instance.get<DashboardResponse>(DASHBOARD_PATH, getAdminDashboardFetchOptions());
}

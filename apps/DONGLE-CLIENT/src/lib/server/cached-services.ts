import { cache } from "react";
import {
    getDisplayMainBannerItems,
    getActiveMainBannerListService as getActiveMainBannerListServiceBase,
    getClubReportFromListService as getClubReportFromListServiceBase,
    getClubListService as getClubListServiceBase,
    getClubReportListService as getClubReportListServiceBase,
    getClubService as getClubServiceBase,
} from "@dongle/service";

export const getClubListService = cache(getClubListServiceBase);
export const getClubService = cache(getClubServiceBase);
export const getClubReportListService = cache(getClubReportListServiceBase);
export const getClubReportFromListService = cache(getClubReportFromListServiceBase);
export const getActiveMainBannerListService = cache(getActiveMainBannerListServiceBase);
export { getDisplayMainBannerItems };

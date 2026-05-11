import { cache } from "react";
import {
    getDisplayMainBannerItems,
    getClubListService as getClubListServiceBase,
    getClubReportService,
    getClubReportListService as getClubReportListServiceBase,
    getClubService as getClubServiceBase,
    getPublicMainBannerListService as getPublicMainBannerListServiceBase,
} from "@dongle/service";

export const getClubListService = cache(getClubListServiceBase);
export const getClubService = cache(getClubServiceBase);
export const getClubReportListService = cache(getClubReportListServiceBase);
export const getPublicMainBannerListService = cache(getPublicMainBannerListServiceBase);
export { getClubReportService, getDisplayMainBannerItems };

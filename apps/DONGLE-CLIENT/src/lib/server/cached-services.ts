import { cache } from "react";
import {
    getDisplayBannerImageUrls,
    getActiveMainBannerListService as getActiveMainBannerListServiceBase,
    getClubListService as getClubListServiceBase,
    getClubReportListService as getClubReportListServiceBase,
    getClubService as getClubServiceBase,
} from "@dongle/service";

export const getClubListService = cache(getClubListServiceBase);
export const getClubService = cache(getClubServiceBase);
export const getClubReportListService = cache(getClubReportListServiceBase);
export const getActiveMainBannerListService = cache(getActiveMainBannerListServiceBase);
export { getDisplayBannerImageUrls };

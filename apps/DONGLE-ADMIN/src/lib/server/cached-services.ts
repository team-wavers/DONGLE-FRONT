import { cache } from "react";
import {
    getActiveMainBannerListService as getActiveMainBannerListServiceBase,
    getClubListService as getClubListServiceBase,
    getClubReportFromListService as getClubReportFromListServiceBase,
    getClubReportListService as getClubReportListServiceBase,
    getClubService as getClubServiceBase,
    getMainBannerFromListService as getMainBannerFromListServiceBase,
    getUserListService as getUserListServiceBase,
    getUserService as getUserServiceBase,
} from "@dongle/service";

export const getClubListService = cache(getClubListServiceBase);
export const getClubService = cache(getClubServiceBase);
export const getClubReportListService = cache(getClubReportListServiceBase);
export const getClubReportFromListService = cache(getClubReportFromListServiceBase);
export const getUserListService = cache(getUserListServiceBase);
export const getUserService = cache(getUserServiceBase);
export const getActiveMainBannerListService = cache(getActiveMainBannerListServiceBase);
export const getMainBannerFromListService = cache(getMainBannerFromListServiceBase);

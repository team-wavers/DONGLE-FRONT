import { cache } from "react";
import {
    getAdminMainBannerService,
    getAdminMainBannerListService as getAdminMainBannerListServiceBase,
    getClubListService as getClubListServiceBase,
    getClubReportFromListService as getClubReportFromListServiceBase,
    getClubReportListService as getClubReportListServiceBase,
    getClubService as getClubServiceBase,
    getUserListService as getUserListServiceBase,
    getUserService as getUserServiceBase,
} from "@dongle/service";

export const getClubListService = cache(getClubListServiceBase);
export const getClubService = cache(getClubServiceBase);
export const getClubReportListService = cache(getClubReportListServiceBase);
export const getClubReportFromListService = cache(getClubReportFromListServiceBase);
export const getUserListService = cache(getUserListServiceBase);
export const getUserService = cache(getUserServiceBase);
export const getAdminMainBannerListService = cache(getAdminMainBannerListServiceBase);
export { getAdminMainBannerService };

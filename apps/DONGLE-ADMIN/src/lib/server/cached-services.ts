import { cache } from "react";
import {
    getAdminMainBannerService,
    getAdminMainBannerListService as getAdminMainBannerListServiceBase,
    getClubListService as getClubListServiceBase,
    getClubReportService,
    getClubReportListService as getClubReportListServiceBase,
    getClubService as getClubServiceBase,
    getUserListService as getUserListServiceBase,
    getUserService as getUserServiceBase,
} from "@dongle/service";

export const getClubListService = cache(() => getClubListServiceBase("admin"));
export const getClubService = cache((clubId: number) => getClubServiceBase(clubId, "admin"));
export const getClubReportListService = cache((clubId: number) => getClubReportListServiceBase(clubId, "admin"));
export const getUserListService = cache(getUserListServiceBase);
export const getUserService = cache(getUserServiceBase);
export const getAdminMainBannerListService = cache(getAdminMainBannerListServiceBase);
export { getAdminMainBannerService, getClubReportService };

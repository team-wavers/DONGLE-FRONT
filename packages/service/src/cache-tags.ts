export const PUBLIC_REVALIDATE_SECONDS = 60;

export const clubTags = {
    list: "club",
    detail: (clubId: number | string) => `club-${clubId}`,
};

export const clubTagGroups = {
    list: () => [clubTags.list],
    detail: (clubId: number | string) => [clubTags.list, clubTags.detail(clubId)],
};

export const userTags = {
    list: "user",
    detail: (userId: number | string) => `user-${userId}`,
};

export const userTagGroups = {
    list: () => [userTags.list],
    detail: (userId: number | string) => [userTags.list, userTags.detail(userId)],
};

export const reportTags = {
    list: "report",
    club: (clubId: number | string) => `report-club-${clubId}`,
    item: (reportId: number | string) => `report-item-${reportId}`,
};

export const reportTagGroups = {
    list: () => [reportTags.list],
    club: (clubId: number | string) => [reportTags.list, reportTags.club(clubId)],
    item: (clubId: number | string, reportId: number | string) => [
        reportTags.list,
        reportTags.club(clubId),
        reportTags.item(reportId),
    ],
};

export const mainBannerTags = {
    list: "main-banner",
    detail: (bannerId: number | string) => `main-banner-${bannerId}`,
};

export const mainBannerTagGroups = {
    list: () => [mainBannerTags.list],
    detail: (bannerId: number | string) => [mainBannerTags.list, mainBannerTags.detail(bannerId)],
};

export const clubScheduleTags = {
    list: "club-schedule",
    club: (clubId: number | string) => `club-schedule-club-${clubId}`,
    item: (scheduleId: number | string) => `club-schedule-item-${scheduleId}`,
};

export const clubScheduleTagGroups = {
    list: () => [clubScheduleTags.list],
    club: (clubId: number | string) => [clubScheduleTags.list, clubScheduleTags.club(clubId)],
    item: (clubId: number | string, scheduleId: number | string) => [
        clubScheduleTags.list,
        clubScheduleTags.club(clubId),
        clubScheduleTags.item(scheduleId),
    ],
    adminItem: (scheduleId: number | string) => [clubScheduleTags.list, clubScheduleTags.item(scheduleId)],
};

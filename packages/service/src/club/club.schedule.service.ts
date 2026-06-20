import FetchInstance from "@dongle/api/instance";
import type { FetchOptions } from "@dongle/api/fetch-types";
import type {
    AdminClubSchedule,
    AdminClubScheduleCalendarQuery,
    AdminClubScheduleDeleteResponse,
    AdminClubScheduleListQuery,
    ClubSchedule,
    ClubScheduleDeleteResponse,
    ClubScheduleStatusFilter,
    CreateClubScheduleRequest,
    PublicClubScheduleCalendarQuery,
    UpdateAdminClubScheduleStatusRequest,
    UpdateClubScheduleRequest,
} from "@dongle/types/club/club.schedule";
import type { Response } from "@dongle/types/response";
import { clubScheduleTagGroups, CLUB_SCHEDULE_REVALIDATE_SECONDS } from "../cache-tags";

const instance = FetchInstance.getInstance();

const CLUBS_PATH = "/clubs";
const ADMIN_CLUB_SCHEDULES_PATH = "/club-schedules";
const PUBLIC_CLUB_SCHEDULES_PATH = "/public/club-schedules";

function getClubScheduleTags(clubId?: number, scheduleId?: number) {
    if (typeof clubId === "number" && typeof scheduleId === "number") {
        return clubScheduleTagGroups.item(clubId, scheduleId);
    }

    if (typeof clubId === "number") {
        return clubScheduleTagGroups.club(clubId);
    }

    return clubScheduleTagGroups.list();
}

function getPublicScheduleFetchOptions(clubId: number): FetchOptions {
    return {
        cache: "force-cache",
        next: {
            tags: getClubScheduleTags(clubId),
            revalidate: CLUB_SCHEDULE_REVALIDATE_SECONDS,
        },
    };
}

function getPublicCalendarScheduleFetchOptions(): FetchOptions {
    return {
        cache: "force-cache",
        next: {
            tags: getClubScheduleTags(),
            revalidate: CLUB_SCHEDULE_REVALIDATE_SECONDS,
        },
    };
}

function getClubSchedulesPath(clubId: number) {
    return `${CLUBS_PATH}/${clubId}/schedules`;
}

function getClubSchedulePath(clubId: number, scheduleId: number) {
    return `${getClubSchedulesPath(clubId)}/${scheduleId}`;
}

function getClubPublicSchedulesPath(clubId: number) {
    return `${CLUBS_PATH}/${clubId}/public-schedules`;
}

function getAdminClubSchedulePath(scheduleId: number) {
    return `${ADMIN_CLUB_SCHEDULES_PATH}/${scheduleId}`;
}

function appendQuery(path: string, query: object) {
    const params = new URLSearchParams();

    Object.entries(query).forEach(([key, value]: [string, unknown]) => {
        if (value !== undefined && value !== "") {
            params.set(key, String(value));
        }
    });

    const queryString = params.toString();
    return queryString ? `${path}?${queryString}` : path;
}

function getResponseResult<T>(response: Response<T>): T {
    if (!response.isSuccess) {
        throw new Error(response.error.detail || response.error.message);
    }

    return response.result;
}

export async function getClubPublicScheduleListService(clubId: number): Promise<ClubSchedule[]> {
    const response = await instance.get<Response<ClubSchedule[]>>(
        getClubPublicSchedulesPath(clubId),
        getPublicScheduleFetchOptions(clubId)
    );
    return getResponseResult(response);
}

export async function getPublicClubScheduleCalendarService(
    query: PublicClubScheduleCalendarQuery
): Promise<AdminClubSchedule[]> {
    const response = await instance.get<Response<AdminClubSchedule[]>>(
        appendQuery(PUBLIC_CLUB_SCHEDULES_PATH, query),
        getPublicCalendarScheduleFetchOptions()
    );
    return getResponseResult(response);
}

export async function getClubScheduleListService(
    clubId: number,
    status?: ClubScheduleStatusFilter
): Promise<ClubSchedule[]> {
    const response = await instance.get<Response<ClubSchedule[]>>(appendQuery(getClubSchedulesPath(clubId), { status }), {
        cache: "no-store",
    });
    return getResponseResult(response);
}

export async function createClubScheduleService(
    clubId: number,
    payload: CreateClubScheduleRequest
): Promise<ClubSchedule> {
    const response = await instance.post<Response<ClubSchedule>>(getClubSchedulesPath(clubId), payload);
    return getResponseResult(response);
}

export async function createAdminCommonClubScheduleService(
    payload: CreateClubScheduleRequest
): Promise<AdminClubSchedule> {
    const response = await instance.post<Response<AdminClubSchedule>>(ADMIN_CLUB_SCHEDULES_PATH, payload);
    return getResponseResult(response);
}

export async function updateClubScheduleService(
    clubId: number,
    scheduleId: number,
    payload: UpdateClubScheduleRequest
): Promise<ClubSchedule> {
    const response = await instance.patch<Response<ClubSchedule>>(getClubSchedulePath(clubId, scheduleId), payload);
    return getResponseResult(response);
}

export async function deleteClubScheduleService(
    clubId: number,
    scheduleId: number
): Promise<ClubScheduleDeleteResponse> {
    return instance.delete<ClubScheduleDeleteResponse>(getClubSchedulePath(clubId, scheduleId));
}

export async function getAdminClubScheduleListService(
    query: AdminClubScheduleListQuery = {}
): Promise<AdminClubSchedule[]> {
    const response = await instance.get<Response<AdminClubSchedule[]>>(appendQuery(ADMIN_CLUB_SCHEDULES_PATH, query), {
        cache: "no-store",
    });
    return getResponseResult(response);
}

export async function getAdminClubScheduleCalendarService(
    query: AdminClubScheduleCalendarQuery
): Promise<AdminClubSchedule[]> {
    const response = await instance.get<Response<AdminClubSchedule[]>>(
        appendQuery(`${ADMIN_CLUB_SCHEDULES_PATH}/calendar`, query),
        {
            cache: "no-store",
        }
    );
    return getResponseResult(response);
}

export async function getAdminClubScheduleService(scheduleId: number): Promise<AdminClubSchedule> {
    const response = await instance.get<Response<AdminClubSchedule>>(getAdminClubSchedulePath(scheduleId), {
        cache: "no-store",
    });
    return getResponseResult(response);
}

export async function updateAdminClubScheduleService(
    scheduleId: number,
    payload: UpdateClubScheduleRequest
): Promise<AdminClubSchedule> {
    const response = await instance.patch<Response<AdminClubSchedule>>(getAdminClubSchedulePath(scheduleId), payload);
    return getResponseResult(response);
}

export async function updateAdminClubScheduleStatusService(
    scheduleId: number,
    payload: UpdateAdminClubScheduleStatusRequest
): Promise<AdminClubSchedule> {
    const response = await instance.patch<Response<AdminClubSchedule>>(
        `${getAdminClubSchedulePath(scheduleId)}/admin-status`,
        payload
    );
    return getResponseResult(response);
}

export async function deleteAdminClubScheduleService(
    scheduleId: number
): Promise<AdminClubScheduleDeleteResponse> {
    return instance.delete<AdminClubScheduleDeleteResponse>(getAdminClubSchedulePath(scheduleId));
}

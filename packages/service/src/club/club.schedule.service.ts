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
    UpdateAdminClubScheduleStatusRequest,
    UpdateClubScheduleRequest,
} from "@dongle/types/club/club.schedule";
import type { Response } from "@dongle/types/response";
import { clubScheduleTagGroups, PUBLIC_REVALIDATE_SECONDS } from "../cache-tags";

const instance = FetchInstance.getInstance();

const CLUBS_PATH = "/clubs";
const ADMIN_CLUB_SCHEDULES_PATH = "/club-schedules";

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
            revalidate: PUBLIC_REVALIDATE_SECONDS,
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
    const response = await instance.get(getClubPublicSchedulesPath(clubId), getPublicScheduleFetchOptions(clubId));
    return getResponseResult(response as Response<ClubSchedule[]>);
}

export async function getClubScheduleListService(
    clubId: number,
    status?: ClubScheduleStatusFilter
): Promise<ClubSchedule[]> {
    const response = await instance.get(appendQuery(getClubSchedulesPath(clubId), { status }), {
        cache: "no-store",
    });
    return getResponseResult(response as Response<ClubSchedule[]>);
}

export async function createClubScheduleService(
    clubId: number,
    payload: CreateClubScheduleRequest
): Promise<ClubSchedule> {
    const response = await instance.post(getClubSchedulesPath(clubId), payload);
    return getResponseResult(response as Response<ClubSchedule>);
}

export async function updateClubScheduleService(
    clubId: number,
    scheduleId: number,
    payload: UpdateClubScheduleRequest
): Promise<ClubSchedule> {
    const response = await instance.patch(getClubSchedulePath(clubId, scheduleId), payload);
    return getResponseResult(response as Response<ClubSchedule>);
}

export async function deleteClubScheduleService(
    clubId: number,
    scheduleId: number
): Promise<ClubScheduleDeleteResponse> {
    const response = await instance.delete(getClubSchedulePath(clubId, scheduleId));
    return response as ClubScheduleDeleteResponse;
}

export async function getAdminClubScheduleListService(
    query: AdminClubScheduleListQuery = {}
): Promise<AdminClubSchedule[]> {
    const response = await instance.get(appendQuery(ADMIN_CLUB_SCHEDULES_PATH, query), {
        cache: "no-store",
    });
    return getResponseResult(response as Response<AdminClubSchedule[]>);
}

export async function getAdminClubScheduleCalendarService(
    query: AdminClubScheduleCalendarQuery
): Promise<AdminClubSchedule[]> {
    const response = await instance.get(appendQuery(`${ADMIN_CLUB_SCHEDULES_PATH}/calendar`, query), {
        cache: "no-store",
    });
    return getResponseResult(response as Response<AdminClubSchedule[]>);
}

export async function getAdminClubScheduleService(scheduleId: number): Promise<AdminClubSchedule> {
    const response = await instance.get(getAdminClubSchedulePath(scheduleId), {
        cache: "no-store",
    });
    return getResponseResult(response as Response<AdminClubSchedule>);
}

export async function updateAdminClubScheduleStatusService(
    scheduleId: number,
    payload: UpdateAdminClubScheduleStatusRequest
): Promise<AdminClubSchedule> {
    const response = await instance.patch(`${getAdminClubSchedulePath(scheduleId)}/admin-status`, payload);
    return getResponseResult(response as Response<AdminClubSchedule>);
}

export async function deleteAdminClubScheduleService(
    scheduleId: number
): Promise<AdminClubScheduleDeleteResponse> {
    const response = await instance.delete(getAdminClubSchedulePath(scheduleId));
    return response as AdminClubScheduleDeleteResponse;
}

import type { Response } from "../response";

export type ClubScheduleType = "recruitment" | "event" | "regular_meeting";

export type ClubScheduleStatusFilter = "all" | "public" | "private" | "upcoming" | "past";

export interface ClubSchedule {
    id: number;
    club_id: number | null;
    title: string;
    type: ClubScheduleType;
    start_at: string;
    end_at: string;
    is_public: boolean;
    location: string | null;
    description: string | null;
    external_url: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface AdminClubSchedule extends ClubSchedule {
    club: {
        id: number;
        name: string;
        category: string;
    } | null;
}

export interface CreateClubScheduleRequest {
    title: string;
    type: ClubScheduleType;
    start_at: string;
    end_at: string;
    is_public: boolean;
    location?: string | null;
    description?: string | null;
    external_url?: string | null;
}

export type UpdateClubScheduleRequest = Partial<CreateClubScheduleRequest>;

export interface AdminClubScheduleListQuery {
    clubName?: string;
    category?: string;
    type?: ClubScheduleType;
    isPublic?: boolean;
    from?: string;
    to?: string;
}

export interface AdminClubScheduleCalendarQuery {
    from: string;
    to: string;
}

export type PublicClubScheduleCalendarQuery = AdminClubScheduleCalendarQuery;

export interface UpdateAdminClubScheduleStatusRequest {
    is_public: boolean;
}

export interface ClubScheduleDeleteResult {
    affected?: number | null;
}

export type ClubScheduleDeleteResponse = Response<ClubScheduleDeleteResult>;
export type AdminClubScheduleDeleteResponse = Response<ClubScheduleDeleteResult>;

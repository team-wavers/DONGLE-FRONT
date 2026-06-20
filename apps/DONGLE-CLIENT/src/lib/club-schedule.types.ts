export type ClubPublicScheduleType = "recruitment" | "event" | "regular_meeting";

export interface ClubPublicSchedule {
    id: number;
    clubId: number | null;
    title: string;
    type: ClubPublicScheduleType;
    start_at: string;
    end_at: string;
    is_public: boolean;
    location: string;
    description: string;
    external_url: string | null;
    clubName?: string;
    category?: string;
}

export interface ClubScheduleGroups {
    ongoing: ClubPublicSchedule[];
    upcoming: ClubPublicSchedule[];
    past: ClubPublicSchedule[];
}

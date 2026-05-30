export type ClubPublicScheduleType = "recruitment" | "event" | "regular_meeting";

export interface ClubPublicSchedule {
    id: number;
    clubId: number;
    title: string;
    type: ClubPublicScheduleType;
    start_at: string;
    end_at: string;
    is_public: boolean;
    location: string;
    description: string;
    external_url: string | null;
}

export interface ClubScheduleGroups {
    ongoing: ClubPublicSchedule[];
    remaining?: ClubPublicSchedule[];
    upcoming: ClubPublicSchedule[];
    past: ClubPublicSchedule[];
}

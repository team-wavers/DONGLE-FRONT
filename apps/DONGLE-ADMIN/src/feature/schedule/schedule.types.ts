export type ScheduleType = "recruitment" | "event" | "regular_meeting" | "notice";

export interface ClubSchedule {
    id: number;
    clubId: number;
    clubName: string;
    category: string;
    title: string;
    type: ScheduleType;
    startsAt: string;
    endsAt: string;
    isPublic: boolean;
    location: string;
    description: string;
    externalUrl?: string;
}

export const SCHEDULE_TYPE_LABELS: Record<ScheduleType, string> = {
    recruitment: "모집",
    event: "행사",
    regular_meeting: "정기모임",
    notice: "공지",
};

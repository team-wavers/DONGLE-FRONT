import ClubScheduleManager from "@/feature/schedule/components/club-schedule-manager";
import { mapClubScheduleToClubSchedule } from "@/feature/schedule/schedule.utils";
import { getClubScheduleListService } from "@dongle/service";

export default async function Page({ params }: { params: Promise<{ clubId: string }> }) {
    const { clubId } = await params;
    const clubIdNumber = Number(clubId);
    const scheduleResponse = await getClubScheduleListService(clubIdNumber);
    const schedules = scheduleResponse.map((schedule) => mapClubScheduleToClubSchedule(schedule));

    return <ClubScheduleManager clubId={clubId} initialSchedules={schedules} />;
}

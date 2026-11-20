import ClubScheduleManager from "@/feature/schedule/components/club-schedule-manager";
import { mapClubScheduleToClubSchedule } from "@/feature/schedule/schedule.utils";
import { getClubScheduleListService } from "@dongle/service";
import { requireClubPageAccess } from "@/shared/action/server-page-auth";

export default async function Page({ params }: { params: Promise<{ clubId: string }> }) {
    const { clubId } = await params;
    await requireClubPageAccess({ clubId });
    const clubIdNumber = Number(clubId);
    const scheduleResponse = await getClubScheduleListService(clubIdNumber);

    if (!scheduleResponse.isSuccess) {
        throw new Error(scheduleResponse.error.detail || scheduleResponse.error.message);
    }

    const schedules = scheduleResponse.result.map((schedule) => mapClubScheduleToClubSchedule(schedule));

    return <ClubScheduleManager clubId={clubId} initialSchedules={schedules} />;
}

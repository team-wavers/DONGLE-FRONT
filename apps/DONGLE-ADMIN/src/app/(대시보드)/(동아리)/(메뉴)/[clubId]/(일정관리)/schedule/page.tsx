import ClubScheduleManager from "@/feature/schedule/components/club-schedule-manager";
import { mapClubScheduleToClubSchedule } from "@/feature/schedule/schedule.utils";
import { getClubScheduleListService, getClubService } from "@dongle/service";

export default async function Page({ params }: { params: Promise<{ clubId: string }> }) {
    const { clubId } = await params;
    const clubIdNumber = Number(clubId);
    const [clubResponse, scheduleResponse] = await Promise.all([
        getClubService(clubIdNumber, "admin"),
        getClubScheduleListService(clubIdNumber),
    ]);
    const club = clubResponse.isSuccess ? clubResponse.result : null;
    const clubName = club?.name ?? "내 동아리";
    const clubCategory = club?.category ?? "내 동아리";
    const schedules = scheduleResponse.map((schedule) =>
        mapClubScheduleToClubSchedule(schedule, {
            clubId: clubIdNumber,
            clubName,
            category: clubCategory,
        })
    );

    return (
        <ClubScheduleManager
            clubId={clubId}
            clubName={clubName}
            clubCategory={clubCategory}
            initialSchedules={schedules}
        />
    );
}

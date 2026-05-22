import AdminPageHeader from "@/shared/components/molecules/layout/admin-page-header/admin-page-header";
import AdminScheduleDashboard from "@/feature/schedule/components/admin-schedule-dashboard";
import { getMonthScheduleQuery, getScheduleMonthKey, mapAdminClubScheduleToClubSchedule } from "@/feature/schedule/schedule.utils";
import { getAdminClubScheduleCalendarService } from "@dongle/service";

export default async function AdminSchedulePage() {
    const initialVisibleMonth = new Date();
    const schedules = await getAdminClubScheduleCalendarService(getMonthScheduleQuery(initialVisibleMonth));

    return (
        <div className="flex h-full w-full flex-col">
            <AdminPageHeader
                title="일정 관리"
                description="회장들이 등록한 동아리 일정을 캘린더와 목록으로 확인합니다."
            />
            <AdminScheduleDashboard
                schedules={schedules.map(mapAdminClubScheduleToClubSchedule)}
                initialVisibleMonth={getScheduleMonthKey(initialVisibleMonth)}
            />
        </div>
    );
}

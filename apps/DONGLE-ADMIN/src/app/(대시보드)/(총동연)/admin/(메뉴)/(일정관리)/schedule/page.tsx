import { Suspense } from "react";
import AdminPageHeader from "@/shared/layout/page-header/admin-page-header";
import AdminScheduleDashboard from "@/feature/schedule/components/admin-schedule-dashboard";
import { getMonthScheduleQuery, getScheduleMonthKey, mapAdminClubScheduleToClubSchedule } from "@/feature/schedule/schedule.utils";
import { getAdminClubScheduleCalendarService } from "@dongle/service";

async function AdminScheduleDashboardSection() {
    const initialVisibleMonth = new Date();
    const schedules = await getAdminClubScheduleCalendarService(getMonthScheduleQuery(initialVisibleMonth));

    return (
        <AdminScheduleDashboard
            schedules={schedules.map(mapAdminClubScheduleToClubSchedule)}
            initialVisibleMonth={getScheduleMonthKey(initialVisibleMonth)}
        />
    );
}

export default function AdminSchedulePage() {
    return (
        <div className="flex h-full w-full flex-col">
            <AdminPageHeader
                title="일정 관리"
                description="동아리 일정과 총동연 공통 일정을 캘린더와 목록으로 확인합니다."
            />
            <Suspense fallback={null}>
                <AdminScheduleDashboardSection />
            </Suspense>
        </div>
    );
}

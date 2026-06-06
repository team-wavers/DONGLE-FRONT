import type { Metadata } from "next";
import PublicScheduleCalendar from "@/components/schedules/public-schedule-calendar";
import { getPublicClubScheduleCalendarService } from "@/lib/server/cached-services";
import {
    getPublicScheduleMonthKey,
    getPublicScheduleMonthQuery,
    mapPublicCalendarScheduleToPublicSchedule,
} from "@/lib/public-schedule-calendar";

interface PublicSchedulesPageProps {
    searchParams?: Promise<{
        month?: string | string[];
    }>;
}

export const metadata: Metadata = {
    title: "전체 일정",
    description: "공개된 동아리 일정과 총동연 공통 일정을 캘린더로 확인합니다.",
    alternates: {
        canonical: "/schedules",
    },
};

export default async function PublicSchedulesPage({ searchParams }: PublicSchedulesPageProps) {
    const params = await searchParams;
    const monthKey = getPublicScheduleMonthKey(params?.month);
    let loadFailed = false;
    const schedules = await getPublicClubScheduleCalendarService(getPublicScheduleMonthQuery(monthKey))
        .then((items) => items.map(mapPublicCalendarScheduleToPublicSchedule))
        .catch(() => {
            loadFailed = true;
            return [];
        });

    return (
        <PublicScheduleCalendar
            key={monthKey}
            schedules={schedules}
            visibleMonthKey={monthKey}
            loadFailed={loadFailed}
        />
    );
}

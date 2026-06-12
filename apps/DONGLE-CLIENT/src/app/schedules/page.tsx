import PublicScheduleCalendar from "@/components/schedules/public-schedule-calendar";
import { buildPageMetadata } from "@/lib/page-metadata";
import { getPublicClubScheduleCalendarService } from "@/lib/server/cached-services";
import {
    getPublicScheduleMonthKey,
    getPublicScheduleMonthQuery,
    mapPublicCalendarScheduleToPublicSchedule,
} from "@/lib/public-schedule-calendar";
import { SCHEDULES_PAGE_DESCRIPTION, SCHEDULES_PAGE_TITLE } from "@/lib/site";

interface PublicSchedulesPageProps {
    searchParams?: Promise<{
        month?: string | string[];
    }>;
}

export const metadata = buildPageMetadata({
    title: SCHEDULES_PAGE_TITLE,
    description: SCHEDULES_PAGE_DESCRIPTION,
    canonicalPath: "/schedules",
});

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

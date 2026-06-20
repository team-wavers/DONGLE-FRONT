import Link from "next/link";
import { Button } from "@dongle/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@dongle/ui/card";
import { Badge } from "@dongle/ui/badge";
import {
    ArrowRight,
    CalendarDays,
    ImageIcon,
    Link as LinkIcon,
    Plus,
    UserPlus,
    Users,
} from "lucide-react";
import {
    getAdminMainBannerListService,
    getClubListService,
    getUserListService,
} from "@/lib/server/cached-services";
import AdminPageHeader from "@/shared/layout/page-header/admin-page-header";
import { getAdminClubScheduleCalendarService } from "@dongle/service";
import { getMonthScheduleQuery } from "@/feature/schedule/schedule.utils";
import { formatKoreanDate } from "@/lib/format/date";

async function getAdminHomeData() {
    const currentMonth = new Date();
    const [clubs, users, banners, schedules] = await Promise.allSettled([
        getClubListService(),
        getUserListService(),
        getAdminMainBannerListService(),
        getAdminClubScheduleCalendarService(getMonthScheduleQuery(currentMonth)),
    ]);

    const isClubError = clubs.status === "rejected" || !clubs.value.isSuccess;
    const isUserError = users.status === "rejected" || !users.value.isSuccess;
    const isBannerError = banners.status === "rejected" || !banners.value.isSuccess;
    const isScheduleError = schedules.status === "rejected";

    const clubList = isClubError ? [] : clubs.value.result ?? [];
    const userList = isUserError ? [] : users.value.result ?? [];
    const bannerList = isBannerError ? [] : banners.value.result ?? [];
    const scheduleList = isScheduleError ? [] : schedules.value;

    return {
        clubs: { data: clubList, isError: isClubError },
        users: { data: userList, isError: isUserError },
        banners: { data: bannerList, isError: isBannerError },
        schedules: { data: scheduleList, isError: isScheduleError },
    };
}

export default async function AdminPage() {
    const { clubs, users, banners, schedules } = await getAdminHomeData();
    const activeBannerCount = banners.data.filter((banner) => banner.is_active).length;
    const recruitingClubCount = clubs.data.filter((club) => club.is_recruiting).length;
    const recentClubs = clubs.data.slice(0, 4);
    const recentUsers = users.data.slice(0, 4);

    const statCards = [
        {
            label: "전체 동아리",
            value: clubs.data.length,
            helper: clubs.isError ? "불러오기 실패" : `모집중 ${recruitingClubCount}개`,
            isError: clubs.isError,
            href: "/admin/club",
            icon: Users,
        },
        {
            label: "사용자",
            value: users.data.length,
            helper: users.isError ? "불러오기 실패" : "관리자/회장 계정",
            isError: users.isError,
            href: "/admin/user",
            icon: UserPlus,
        },
        {
            label: "이번 달 일정",
            value: schedules.data.length,
            helper: schedules.isError ? "불러오기 실패" : "공개 상태 포함",
            isError: schedules.isError,
            href: "/admin/schedule",
            icon: CalendarDays,
        },
        {
            label: "활성 배너",
            value: activeBannerCount,
            helper: banners.isError ? "불러오기 실패" : `전체 ${banners.data.length}개`,
            isError: banners.isError,
            href: "/admin/banner",
            icon: ImageIcon,
        },
    ];

    return (
        <div className="flex w-full flex-col gap-6">
            <AdminPageHeader
                title="관리자 홈"
                description="동아리 운영 현황과 자주 쓰는 관리 작업을 한곳에서 확인합니다."
                actions={
                    <Button asChild className="h-10 gap-2">
                        <Link href="/admin/club-register">
                            <LinkIcon className="h-4 w-4" />
                            등록 URL 발급
                        </Link>
                    </Button>
                }
            />

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {statCards.map((item) => {
                    const Icon = item.icon;

                    return (
                        <Link key={item.label} href={item.href} className="group">
                            <Card className="h-full gap-3 rounded-lg py-4 shadow-none transition-colors group-hover:bg-zinc-50">
                                <CardContent className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                                        <p
                                            className={
                                                item.isError
                                                    ? "mt-2 text-xl font-bold text-red-600"
                                                    : "mt-2 text-3xl font-bold text-zinc-900"
                                            }>
                                            {item.isError ? "실패" : item.value}
                                        </p>
                                        <p
                                            className={
                                                item.isError
                                                    ? "mt-1 text-xs font-medium text-red-600"
                                                    : "mt-1 text-xs text-muted-foreground"
                                            }>
                                            {item.helper}
                                        </p>
                                    </div>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    );
                })}
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
                <Card className="rounded-lg py-0 shadow-none">
                    <CardHeader className="border-b py-4">
                        <div className="flex items-center justify-between gap-3">
                            <CardTitle className="text-base">최근 동아리</CardTitle>
                            <Link href="/admin/club" className="text-sm font-semibold text-blue-600">
                                전체 보기
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent className="px-0">
                        {clubs.isError ? (
                            <p className="px-5 py-8 text-sm text-red-600">동아리 목록을 불러오지 못했습니다.</p>
                        ) : recentClubs.length === 0 ? (
                            <p className="px-5 py-8 text-sm text-muted-foreground">등록된 동아리가 없습니다.</p>
                        ) : (
                            recentClubs.map((club) => (
                                <Link
                                    key={club.id}
                                    href={`/admin/club/${club.id}`}
                                    className="grid grid-cols-[minmax(0,1fr)_120px_100px_24px] items-center gap-3 border-b px-5 py-4 text-sm last:border-b-0 hover:bg-zinc-50">
                                    <span className="truncate font-semibold text-zinc-900">{club.name}</span>
                                    <Badge variant="secondary" className="w-fit font-semibold">
                                        {club.category}
                                    </Badge>
                                    <Badge
                                        className={
                                            club.is_recruiting
                                                ? "w-fit border-emerald-200 bg-emerald-50 text-emerald-700"
                                                : "w-fit border-zinc-200 bg-zinc-100 text-zinc-600"
                                        }>
                                        {club.is_recruiting ? "모집중" : "마감"}
                                    </Badge>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                </Link>
                            ))
                        )}
                    </CardContent>
                </Card>

                <div className="grid gap-4">
                    <Card className="rounded-lg py-0 shadow-none">
                        <CardHeader className="border-b py-4">
                            <CardTitle className="text-base">빠른 작업</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-2 py-4">
                            <Button asChild variant="outline" className="h-10 w-full justify-start gap-2">
                                <Link href="/admin/club-register">
                                    <LinkIcon className="h-4 w-4" />
                                    동아리 등록 URL 발급
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="h-10 w-full justify-start gap-2">
                                <Link href="/admin/banner/create">
                                    <Plus className="h-4 w-4" />
                                    메인 배너 등록
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="h-10 w-full justify-start gap-2">
                                <Link href="/admin/user">
                                    <UserPlus className="h-4 w-4" />
                                    관리자 계정 생성
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="rounded-lg py-0 shadow-none">
                        <CardHeader className="border-b py-4">
                            <CardTitle className="text-base">최근 사용자</CardTitle>
                        </CardHeader>
                        <CardContent className="px-0">
                            {users.isError ? (
                                <p className="px-5 py-8 text-sm text-red-600">사용자 목록을 불러오지 못했습니다.</p>
                            ) : recentUsers.length === 0 ? (
                                <p className="px-5 py-8 text-sm text-muted-foreground">등록된 사용자가 없습니다.</p>
                            ) : (
                                recentUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center justify-between gap-3 border-b px-5 py-3 last:border-b-0">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-zinc-900">{user.name}</p>
                                            <p className="mt-1 truncate text-xs text-muted-foreground">
                                                {user.login_id} · {formatKoreanDate(user.created_at)}
                                            </p>
                                        </div>
                                        <Badge variant="secondary" className="shrink-0">
                                            {user.role === "admin" ? "관리자" : "회장"}
                                        </Badge>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

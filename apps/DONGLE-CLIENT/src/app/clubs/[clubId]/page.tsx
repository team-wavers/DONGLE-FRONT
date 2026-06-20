import ClubDetailTabs from "@/components/club-detail/club-detail-tabs";
import ClubReportsTabContent from "@/components/club-detail/club-reports-tab-content";
import ClubSchedulesTabContent from "@/components/club-detail/club-schedules-tab-content";
import ClubSocialLinks from "@/components/club-detail/club-social-links";
import { getClubCategoryPresentation } from "@/components/main/club-category-presentation";
import ClubIconAvatar from "@/components/main/club-icon-avatar";
import { getClubScheduleGroups, mapClubScheduleToPublicSchedule } from "@/lib/club-schedule";
import {
    getClubPublicScheduleListService,
    getClubReportListService,
    getClubService,
} from "@/lib/server/cached-services";
import { RecruitmentStatusBadge } from "@dongle/ui/badges/recruitment-status-badge";
import { Skeleton } from "@dongle/ui/skeleton";
import { formatDateRange, normalizeSocialUrl } from "@dongle/ui/utils";
import { formatMobilePhoneNumber } from "@dongle/utils";
import { ArrowLeft, CalendarDays, MapPin, Phone, UserRound } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { buildClubFallbackMetadata, buildClubPageMetadata } from "@/lib/club-page-metadata";

interface ClubDetailPageProps {
    params: Promise<{ clubId: string }>;
}

function ClubTabPanelSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-10 w-32 rounded-md" />
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
        </div>
    );
}

async function ClubReportsTabPanel({ clubId, clubName }: { clubId: string; clubName: string }) {
    const clubIdNumber = Number(clubId);

    try {
        const reportsResponse = await getClubReportListService(clubIdNumber);

        if (!reportsResponse.isSuccess) {
            return <ClubReportsTabContent clubId={clubId} clubName={clubName} reports={[]} loadFailed />;
        }

        const reports = reportsResponse.result.map((report) => ({
            id: report.id,
            title: report.title,
            createdAt: report.createdAt,
            image_urls: report.image_urls,
        }));

        return <ClubReportsTabContent clubId={clubId} clubName={clubName} reports={reports} />;
    } catch {
        return <ClubReportsTabContent clubId={clubId} clubName={clubName} reports={[]} loadFailed />;
    }
}

async function ClubSchedulesTabPanel({ clubIdNumber, clubName }: { clubIdNumber: number; clubName: string }) {
    try {
        const scheduleResponse = await getClubPublicScheduleListService(clubIdNumber);
        const schedules = getClubScheduleGroups(scheduleResponse.map(mapClubScheduleToPublicSchedule), {
            clubId: clubIdNumber,
        });

        return <ClubSchedulesTabContent clubName={clubName} schedules={schedules} />;
    } catch {
        return (
            <ClubSchedulesTabContent
                clubName={clubName}
                schedules={{
                    ongoing: [],
                    upcoming: [],
                    past: [],
                }}
                loadFailed
            />
        );
    }
}

export async function generateMetadata({ params }: ClubDetailPageProps): Promise<Metadata> {
    const { clubId } = await params;
    const clubIdNumber = Number(clubId);

    if (Number.isNaN(clubIdNumber)) {
        return buildClubFallbackMetadata(clubId, "invalid");
    }

    const clubResponse = await getClubService(clubIdNumber);

    if (!clubResponse.isSuccess) {
        if (clubResponse.error.status === 404) {
            return buildClubFallbackMetadata(clubId, "not_found");
        }

        throw new Error("동아리 정보를 불러오는데 실패했습니다.");
    }

    if (!clubResponse.result) {
        return buildClubFallbackMetadata(clubId, "not_found");
    }

    return buildClubPageMetadata(clubResponse.result);
}

async function ClubDetailContent({ clubId }: { clubId: string }) {
    const clubIdNumber = Number(clubId);
    if (Number.isNaN(clubIdNumber)) {
        notFound();
    }

    const clubResponse = await getClubService(clubIdNumber);

    if (!clubResponse.isSuccess) {
        if (clubResponse.error.status === 404) {
            notFound();
        }

        throw new Error("동아리 정보를 불러오는데 실패했습니다.");
    }

    if (!clubResponse.result) {
        notFound();
    }

    const club = clubResponse.result;
    const intro = {
        description: club.description,
        main_activities: club.main_activities,
    };
    const instagramUrl = normalizeSocialUrl("instagram", club.sns?.instagram);
    const youtubeUrl = normalizeSocialUrl("youtube", club.sns?.youtube);
    const hasSocialLinks = Boolean(instagramUrl || youtubeUrl);
    const categoryPresentation = getClubCategoryPresentation(club.category);
    const recruitPeriod =
        club.recruit_start && club.recruit_end ? formatDateRange(club.recruit_start, club.recruit_end) : "미정";
    const presidentPhone = club.president?.phone;
    const formattedPresidentPhone = presidentPhone ? formatMobilePhoneNumber(presidentPhone) : "-";
    const infoItems = [
        { icon: MapPin, label: "동아리방", value: club.location || "-" },
        { icon: CalendarDays, label: "모집기간", value: recruitPeriod },
        { icon: UserRound, label: "회장", value: club.president?.name || "-" },
        { icon: Phone, label: "연락처", value: formattedPresidentPhone },
    ];

    return (
        <section className="flex flex-col gap-8 py-6">
            <header className="flex flex-col gap-6">
                <div className="flex flex-col gap-5 py-4 md:flex-row md:items-end md:justify-between">
                    <div className="flex min-w-0 items-center gap-4">
                        <ClubIconAvatar name={club.name} category={club.category} iconUrl={club.icon_url} size="lg" />

                        <div className="min-w-0">
                            <p className="text-sm font-bold text-zinc-400">{club.category}</p>
                            <h1 className="mt-1 break-words text-4xl font-bold tracking-normal text-zinc-950 md:text-5xl">
                                {club.name}
                            </h1>
                        </div>
                    </div>

                    <RecruitmentStatusBadge isRecruiting={club.is_recruiting} size="lg" />
                </div>

                {club.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {club.tags.map((tag: string, index: number) => (
                            <span
                                key={`${tag}-${index}`}
                                className={`rounded-md border px-3 py-2 text-sm font-bold ${categoryPresentation.labelClassName}`}>
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </header>

            <section className={hasSocialLinks ? "grid gap-5 md:grid-cols-[minmax(0,1fr)_280px]" : "grid gap-5"}>
                <div className="space-y-5">
                    <dl className="grid gap-3 sm:grid-cols-2">
                        {infoItems.map((item) => {
                            const Icon = item.icon;

                            return (
                                <div key={item.label} className="rounded-lg border border-zinc-200 bg-white p-4">
                                    <Icon className="mb-3 size-5 text-zinc-400" />
                                    <dt className="text-sm font-bold text-zinc-400">{item.label}</dt>
                                    <dd className="mt-1 break-words font-bold text-zinc-950">{item.value}</dd>
                                </div>
                            );
                        })}
                    </dl>

                    <ClubSocialLinks
                        clubId={clubIdNumber}
                        clubName={club.name}
                        instagramUrl={instagramUrl}
                        youtubeUrl={youtubeUrl}
                        className="md:hidden"
                    />

                    <ClubDetailTabs
                        club={intro}
                        clubId={clubId}
                        clubName={club.name}
                        reportsContent={
                            <Suspense fallback={<ClubTabPanelSkeleton />}>
                                <ClubReportsTabPanel clubId={clubId} clubName={club.name} />
                            </Suspense>
                        }
                        schedulesContent={
                            <Suspense fallback={<ClubTabPanelSkeleton />}>
                                <ClubSchedulesTabPanel clubIdNumber={clubIdNumber} clubName={club.name} />
                            </Suspense>
                        }
                    />
                </div>

                {hasSocialLinks && (
                    <aside>
                        <ClubSocialLinks
                            clubId={clubIdNumber}
                            clubName={club.name}
                            instagramUrl={instagramUrl}
                            youtubeUrl={youtubeUrl}
                            className="hidden md:flex"
                        />
                    </aside>
                )}
            </section>
        </section>
    );
}

export default async function ClubDetailPage({ params }: ClubDetailPageProps) {
    const { clubId } = await params;

    return (
        <>
            <div className="pt-12">
                <Link
                    href="/"
                    className="inline-flex items-center rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    목록으로 돌아가기
                </Link>
            </div>

            <ClubDetailContent clubId={clubId} />
        </>
    );
}

import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
    getClubPublicScheduleListService,
    getClubReportListService,
    getClubService,
} from "@/lib/server/cached-services";
import { getClubScheduleGroups, mapClubScheduleToPublicSchedule } from "@/lib/club-schedule";
import { RecruitmentStatusBadge } from "@dongle/ui/badges/recruitment-status-badge";
import { formatMobilePhoneNumber } from "@dongle/utils";
import { formatDateRange, normalizeSocialUrl } from "@dongle/ui/utils";
import ClubDetailTabs from "@/components/club-detail/club-detail-tabs";
import ClubSocialLinks from "@/components/club-detail/club-social-links";
import ClubIconAvatar from "@/components/main/club-icon-avatar";
import { getClubCategoryPresentation } from "@/components/main/club-category-presentation";
import { ArrowLeft, CalendarDays, MapPin, Phone, UserRound } from "lucide-react";
import { Skeleton } from "@dongle/ui/skeleton";

interface ClubDetailPageProps {
    params: Promise<{ clubId: string }>;
}

const siteTitle = "동글";
const defaultOgImage = "/logo/logo-og.png";

function buildClubDescription(description: string, mainActivities: string) {
    const rawDescription = description?.trim() || mainActivities?.trim() || "동아리 상세 정보를 확인해보세요.";
    return rawDescription.length > 140 ? `${rawDescription.slice(0, 137)}...` : rawDescription;
}

export async function generateMetadata({ params }: ClubDetailPageProps): Promise<Metadata> {
    const { clubId } = await params;
    const clubIdNumber = Number(clubId);

    if (Number.isNaN(clubIdNumber)) {
        return {
            title: "동아리 상세",
            alternates: {
                canonical: `/clubs/${clubId}`,
            },
        };
    }

    const clubResponse = await getClubService(clubIdNumber);

    if (!clubResponse.isSuccess || !clubResponse.result) {
        return {
            title: "동아리 상세",
            description: "동아리 상세 정보를 확인해보세요.",
            alternates: {
                canonical: `/clubs/${clubId}`,
            },
        };
    }

    const club = clubResponse.result;
    const title = club.name;
    const description = buildClubDescription(club.description, club.main_activities);
    const image = club.icon_url || defaultOgImage;
    const canonicalPath = `/clubs/${club.id}`;

    return {
        title,
        description,
        alternates: {
            canonical: canonicalPath,
        },
        openGraph: {
            title: `${title} | ${siteTitle}`,
            description,
            url: canonicalPath,
            siteName: siteTitle,
            locale: "ko_KR",
            type: "article",
            images: [
                {
                    url: image,
                    alt: `${title} 대표 이미지`,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: `${title} | ${siteTitle}`,
            description,
            images: [image],
        },
    };
}

async function ClubDetailContent({ clubId }: { clubId: string }) {
    const clubIdNumber = Number(clubId);
    if (Number.isNaN(clubIdNumber)) {
        notFound();
    }

    const [clubResult, reportsResult, scheduleResult] = await Promise.allSettled([
        getClubService(clubIdNumber),
        getClubReportListService(clubIdNumber),
        getClubPublicScheduleListService(clubIdNumber),
    ]);

    if (clubResult.status === "rejected") {
        notFound();
    }

    const clubResponse = clubResult.value;
    if (!clubResponse.isSuccess || !clubResponse.result) {
        notFound();
    }

    const club = clubResponse.result;
    const reportsResponse = reportsResult.status === "fulfilled" ? reportsResult.value : null;
    const reportLoadFailed = !reportsResponse?.isSuccess;
    const reports = reportsResponse?.isSuccess
        ? reportsResponse.result.map((report) => ({
              id: report.id,
              title: report.title,
              createdAt: report.createdAt,
              image_urls: report.image_urls,
          }))
        : [];
    const scheduleResponse = scheduleResult.status === "fulfilled" ? scheduleResult.value : [];
    const scheduleLoadFailed = scheduleResult.status === "rejected";
    const schedules = getClubScheduleGroups(
        scheduleResponse.map(mapClubScheduleToPublicSchedule),
        { clubId: clubIdNumber }
    );
    const intro = {
        description: club.description,
        main_activities: club.main_activities,
    };
    const instagramUrl = normalizeSocialUrl("instagram", club.sns.instagram);
    const youtubeUrl = normalizeSocialUrl("youtube", club.sns.youtube);
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
                        schedules={schedules}
                        scheduleLoadFailed={scheduleLoadFailed}
                        reports={reports}
                        reportLoadFailed={reportLoadFailed}
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

function ClubDetailFallback() {
    return (
        <section className="py-6 flex flex-col gap-12">
            <div className="flex flex-col gap-6">
                <div className="py-4 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4 min-w-0">
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <div className="min-w-0 space-y-2">
                            <Skeleton className="h-9 w-48" />
                            <Skeleton className="h-5 w-24" />
                        </div>
                    </div>
                    <Skeleton className="h-9 w-24 rounded-full" />
                </div>
                <Skeleton className="h-52 w-full rounded-xl" />
            </div>
            <div className="space-y-6">
                <Skeleton className="h-11 w-full" />
                <Skeleton className="h-72 w-full rounded-xl" />
            </div>
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

            <Suspense fallback={<ClubDetailFallback />}>
                <ClubDetailContent clubId={clubId} />
            </Suspense>
        </>
    );
}

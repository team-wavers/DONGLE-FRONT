import ClubApplyButton from "@/components/club-detail/club-apply-button";
import ClubDetailSocialInfoLink from "@/components/club-detail/club-detail-social-info-link";
import ClubDetailTabs from "@/components/club-detail/club-detail-tabs";
import ClubReportsTabContent from "@/components/club-detail/club-reports-tab-content";
import ClubSchedulesTabContent from "@/components/club-detail/club-schedules-tab-content";
import { getClubCategoryPresentation } from "@/components/main/club-category-presentation";
import ClubIconAvatar from "@/components/main/club-icon-avatar";
import { getClubScheduleGroups, mapClubScheduleToPublicSchedule } from "@/lib/club-schedule";
import { formatRecruitDdayLabel, getRecruitDday } from "@/lib/recruitment";
import { resolveReportThumbnailUrl } from "@/lib/report-thumbnail";
import {
    getClubPublicScheduleListService,
    getClubReportListService,
    getClubService,
} from "@/lib/server/cached-services";
import { RecruitmentStatusBadge } from "@dongle/ui/badges/recruitment-status-badge";
import { Skeleton } from "@dongle/ui/skeleton";
import { formatDateRange, normalizeSocialUrl } from "@dongle/ui/utils";
import { formatMobilePhoneNumber, normalizeClubTags, normalizeExternalUrl } from "@dongle/utils";
import { ArrowLeft, CalendarDays, Instagram, MapPin, Phone, UserRound, Youtube } from "lucide-react";
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
            thumbnailUrl: resolveReportThumbnailUrl(report.image_urls, report.content),
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
    const categoryPresentation = getClubCategoryPresentation(club.category);
    const recruitPeriod =
        club.recruit_start && club.recruit_end ? formatDateRange(club.recruit_start, club.recruit_end) : "미정";
    const recruitDday = club.is_recruiting ? getRecruitDday(club.recruit_end) : null;
    const applyUrl = club.is_recruiting ? normalizeExternalUrl(club.apply_url) : null;
    const tags = normalizeClubTags(club.tags);
    const presidentPhone = club.president?.phone;
    const formattedPresidentPhone = presidentPhone ? formatMobilePhoneNumber(presidentPhone) : "-";
    type InfoItem = {
        icon: React.ComponentType<{ className?: string }>;
        label: string;
        value: string;
        mono: boolean;
        socialPlatform?: "instagram" | "youtube";
        href?: string;
    };
    const infoItems: InfoItem[] = [
        { icon: MapPin, label: "동아리방", value: club.location || "-", mono: false },
        { icon: CalendarDays, label: "모집기간", value: recruitPeriod, mono: true },
        { icon: UserRound, label: "회장", value: club.president?.name || "-", mono: false },
        { icon: Phone, label: "연락처", value: formattedPresidentPhone, mono: true },
    ];
    if (instagramUrl) {
        infoItems.push({
            icon: Instagram,
            label: "instagram",
            value: "instagram",
            mono: false,
            href: instagramUrl,
            socialPlatform: "instagram",
        });
    }
    if (youtubeUrl) {
        infoItems.push({
            icon: Youtube,
            label: "youtube",
            value: "youtube",
            mono: false,
            href: youtubeUrl,
            socialPlatform: "youtube",
        });
    }

    return (
        <section className="flex flex-col gap-5 py-6 md:gap-8">
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

                    <div className="flex flex-col items-stretch gap-4 md:items-end">
                        <div className="flex items-center gap-2 md:justify-end">
                            {recruitDday !== null && recruitDday >= 0 && (
                                <span className="rounded-md bg-red-50 px-2.5 py-1.5 text-sm font-bold text-red-600">
                                    {formatRecruitDdayLabel(recruitDday)}
                                </span>
                            )}
                            {!applyUrl && <RecruitmentStatusBadge isRecruiting={club.is_recruiting} size="lg" />}
                        </div>
                        {applyUrl && <ClubApplyButton clubId={clubIdNumber} clubName={club.name} applyUrl={applyUrl} />}
                    </div>
                </div>

                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag: string, index: number) => (
                            <span
                                key={`${tag}-${index}`}
                                className={`rounded-md border px-3 py-2 text-sm font-bold ${categoryPresentation.labelClassName}`}>
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </header>

            <section className="grid grid-cols-1 gap-5">
                <div className="min-w-0 space-y-5">
                    <dl className="divide-y divide-zinc-100 rounded-lg border border-zinc-200 bg-white">
                        {infoItems.map((item) => {
                            const Icon = item.icon;
                            const content = (
                                <>
                                    <Icon className="size-4 shrink-0 text-zinc-400" aria-hidden="true" />
                                    <dt className="w-20 shrink-0 text-sm font-bold text-zinc-400">{item.label}</dt>
                                    <dd
                                        className={`min-w-0 flex-1 truncate text-sm font-medium text-zinc-950 ${
                                            item.mono ? "font-mono" : ""
                                        }`}>
                                        {item.value}
                                    </dd>
                                </>
                            );

                            if (item.href && item.socialPlatform) {
                                return (
                                    <ClubDetailSocialInfoLink
                                        key={item.label}
                                        clubId={clubIdNumber}
                                        clubName={club.name}
                                        platform={item.socialPlatform}
                                        href={item.href}
                                        label={item.label}
                                        value={item.value}
                                    />
                                );
                            }

                            return (
                                <div key={item.label} className="flex items-center gap-3 px-4 py-3">
                                    {content}
                                </div>
                            );
                        })}
                    </dl>

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

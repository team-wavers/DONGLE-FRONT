import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getClubReportListService, getClubService } from "@/lib/server/cached-services";
import { Badge, RecruitmentStatusBadge, formatDateRange } from "@dongle/ui";
import ClubDetailTabs from "@/components/club-detail/club-detail-tabs";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@dongle/ui/skeleton";

interface ClubDetailPageProps {
    params: Promise<{ clubId: string }>;
}

const siteTitle = "동글";
const defaultOgImage = "/logo/logo-full.svg";

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

const styles = {
    dt: "w-24 shrink-0 text-zinc-400 font-bold",
    dd: "text-zinc-800 font-medium",
} as const;

async function ClubDetailContent({ clubId }: { clubId: string }) {
    const clubIdNumber = Number(clubId);
    if (Number.isNaN(clubIdNumber)) {
        notFound();
    }

    const [clubResponse, reportsResponse] = await Promise.all([
        getClubService(clubIdNumber),
        getClubReportListService(clubIdNumber),
    ]);

    if (!clubResponse.isSuccess || !clubResponse.result) {
        notFound();
    }

    const club = clubResponse.result;
    const reports = reportsResponse.isSuccess
        ? reportsResponse.result.map((report) => ({
              id: report.id,
              title: report.title,
              createdAt: report.createdAt,
              content: report.content,
              image_urls: report.image_urls,
          }))
        : [];
    const intro = {
        description: club.description,
        main_activities: club.main_activities,
    };

    return (
        <section className="py-6 flex flex-col gap-12">
            <header className="flex flex-col gap-6">
                <div className="py-4 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4 min-w-0">
                        {club.icon_url ? (
                            <Image
                                src={club.icon_url}
                                alt={`${club.name} 아이콘`}
                                width={64}
                                height={64}
                                className="h-16 w-16 rounded-full object-cover border border-zinc-200"
                            />
                        ) : null}

                        <div className="min-w-0">
                            <h1 className="text-3xl font-bold text-zinc-900 break-words">{club.name}</h1>
                            <p className="mt-1 text-zinc-500 font-medium">{club.category}</p>
                        </div>
                    </div>

                    <RecruitmentStatusBadge isRecruiting={club.is_recruiting} size="lg" />
                </div>

                <dl className="grid grid-cols-1 gap-y-4 rounded-xl bg-zinc-50 p-5">
                    <div className="flex gap-4">
                        <dt className={styles.dt}>동아리방</dt>
                        <dd className={styles.dd}>{club.location || "-"}</dd>
                    </div>
                    <div className="flex gap-4">
                        <dt className={styles.dt}>회장 이름</dt>
                        <dd className={styles.dd}>{club.president?.name || "-"}</dd>
                    </div>
                    <div className="flex gap-4">
                        <dt className={styles.dt}>회장 연락처</dt>
                        <dd className={styles.dd}>{club.president?.phone || "-"}</dd>
                    </div>
                    <div className="flex gap-4">
                        <dt className={styles.dt}>모집기간</dt>
                        <dd className={styles.dd}>
                            {club.recruit_start && club.recruit_end
                                ? formatDateRange(club.recruit_start, club.recruit_end)
                                : "미정"}
                        </dd>
                    </div>
                    {club.tags.length > 0 && (
                        <div className="flex gap-4">
                            <dt className={styles.dt}>태그</dt>
                            <dd className="text-zinc-800 flex flex-wrap gap-2">
                                {club.tags.map((tag: string, index: number) => (
                                    <Badge
                                        key={`${tag}-${index}`}
                                        variant="outline"
                                        className="text-zinc-700 px-3 py-1 bg-white font-semibold">
                                        {tag}
                                    </Badge>
                                ))}
                            </dd>
                        </div>
                    )}
                    {(club.sns.instagram || club.sns.youtube) && (
                        <div className="flex gap-4">
                            <dt className={styles.dt}>SNS</dt>
                            <dd className="flex items-center gap-4 text-sm font-medium">
                                {club.sns.instagram && (
                                    <Link
                                        href={club.sns.instagram}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-zinc-700 underline underline-offset-4 hover:text-primary">
                                        instagram
                                    </Link>
                                )}
                                {club.sns.youtube && (
                                    <Link
                                        href={club.sns.youtube}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-zinc-700 underline underline-offset-4 hover:text-primary">
                                        youtube
                                    </Link>
                                )}
                            </dd>
                        </div>
                    )}
                </dl>
            </header>

            <ClubDetailTabs club={intro} reports={reports} />
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

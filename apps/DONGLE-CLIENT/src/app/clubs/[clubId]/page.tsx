import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, RecruitmentStatusBadge, formatDateRange } from "@dongle/ui";
import { getClubReportListService, getClubService } from "@dongle/service";
import ClubDetailTabs from "@/components/club-detail/club-detail-tabs";
import { ArrowLeft } from "lucide-react";

interface ClubDetailPageProps {
    params: Promise<{ clubId: string }>;
}

const styles = {
    dt: "w-24 shrink-0 text-zinc-400 font-bold",
    dd: "text-zinc-800 font-medium",
} as const;

export default async function ClubDetailPage({ params }: ClubDetailPageProps) {
    const { clubId } = await params;

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
    const reports = reportsResponse.isSuccess ? reportsResponse.result : [];

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

            <section className="py-6 flex flex-col gap-12">
                <header className="flex flex-col gap-6">
                    <div className="py-4 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-4 min-w-0">
                            {club.icon_url ? (
                                <img
                                    src={club.icon_url}
                                    alt={`${club.name} 아이콘`}
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
                                    {club.tags.map((tag) => (
                                        <Badge
                                            key={tag}
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

                <ClubDetailTabs club={club} reports={reports} />
            </section>
        </>
    );
}

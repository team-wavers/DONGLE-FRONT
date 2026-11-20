"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ImageIcon } from "lucide-react";
import { formatDateByLocale } from "@dongle/utils/date";
import type { HomeActivityReport } from "@/lib/home-activity-reports";
import { trackDongleEvent } from "@/lib/analytics";

interface HomeActivitySectionProps {
    reports: HomeActivityReport[];
}

export default function HomeActivitySection({ reports }: HomeActivitySectionProps) {
    if (reports.length === 0) return null;

    return (
        <section aria-labelledby="home-activity-heading" className="space-y-4 border-b border-zinc-200 pb-7 md:pb-8">
            <div className="space-y-1.5">
                <h2 id="home-activity-heading" className="text-xl font-bold tracking-tight text-zinc-950">
                    요즘 동아리는
                </h2>
                <p className="text-sm text-zinc-600">여러 동아리에서 전해온 최근 활동 소식</p>
            </div>
            <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:overflow-visible md:pb-0">
                {reports.map((report) => (
                    <Link
                        key={`${report.clubId}-${report.reportId}`}
                        href={`/clubs/${report.clubId}/reports/${report.reportId}`}
                        onClick={() =>
                            trackDongleEvent("report_click", {
                                club_id: report.clubId,
                                club_name: report.clubName,
                                report_id: report.reportId,
                            })
                        }
                        className="group min-w-0 basis-[78%] shrink-0 snap-start rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 md:basis-auto">
                        <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-zinc-100">
                            {report.thumbnailUrl ? (
                                <Image
                                    src={report.thumbnailUrl}
                                    alt={`${report.clubName} ${report.title} 이미지`}
                                    fill
                                    sizes="(min-width: 1024px) 232px, (min-width: 768px) calc((100vw - 96px) / 4), 78vw"
                                    className="object-contain"
                                />
                            ) : (
                                <div className="flex h-full flex-col items-center justify-center gap-2 text-zinc-500">
                                    <ImageIcon className="size-6" aria-hidden="true" />
                                    <span className="text-xs">이미지 없음</span>
                                </div>
                            )}
                        </div>
                        <div className="mt-3 flex min-w-0 items-center justify-between gap-2">
                            <p className="truncate text-sm font-bold text-zinc-900">{report.clubName}</p>
                            <time dateTime={report.createdAt} className="shrink-0 text-xs text-zinc-600">
                                {formatDateByLocale(report.createdAt)}
                            </time>
                        </div>
                        <h3 className="mt-1 line-clamp-2 text-sm font-medium leading-5 text-zinc-900 transition-colors group-hover:text-primary">
                            {report.title}
                        </h3>
                    </Link>
                ))}
            </div>
        </section>
    );
}

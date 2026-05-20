"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { formatDateByLocale } from "@dongle/ui/utils";

type ClubReportCardViewModel = {
    id: number;
    title: string;
    createdAt: string;
    image_urls: string[];
};

interface ClubReportsTabContentProps {
    clubId: string;
    reports: ClubReportCardViewModel[];
    loadFailed?: boolean;
}

export default function ClubReportsTabContent({
    clubId,
    reports,
    loadFailed = false,
}: ClubReportsTabContentProps) {
    if (loadFailed) {
        return (
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 py-16 text-center text-zinc-500">
                활동보고서를 불러오지 못했습니다. 잠시 후 다시 확인해주세요.
            </div>
        );
    }

    if (reports.length === 0) {
        return (
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 py-16 text-center text-zinc-500">
                등록된 활동보고서가 없습니다.
            </div>
        );
    }
    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {reports.map((report) => (
                <Link
                    key={report.id}
                    href={`/clubs/${clubId}/reports/${report.id}`}
                    className="w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white text-left transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
                    <div className="relative aspect-[16/10] bg-zinc-100">
                        {report.image_urls[0] ? (
                            <Image
                                src={report.image_urls[0]}
                                alt={`${report.title} 썸네일`}
                                fill
                                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                                className="object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm text-zinc-400">
                                이미지 없음
                            </div>
                        )}
                    </div>
                    <div className="space-y-2 p-4">
                        <h3 className="line-clamp-2 font-semibold text-zinc-900">{report.title}</h3>
                        <p className="text-sm text-zinc-600">{formatDateByLocale(report.createdAt)}</p>
                    </div>
                </Link>
            ))}
        </div>
    );
}

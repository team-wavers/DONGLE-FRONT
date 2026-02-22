"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { formatDateByLocale } from "@dongle/ui";
import type { ClubReport } from "@dongle/types/club/club.report";
import ClubReportDetailModal from "./club-report-detail-modal";

interface ClubReportsTabContentProps {
    reports: ClubReport[];
}

export default function ClubReportsTabContent({ reports }: ClubReportsTabContentProps) {
    const [selectedReportId, setSelectedReportId] = useState<number | null>(null);

    const selectedReport = useMemo(
        () => reports.find((report) => report.id === selectedReportId) ?? null,
        [reports, selectedReportId]
    );

    const openReportModal = (report: ClubReport) => {
        setSelectedReportId(report.id);
    };

    const closeReportModal = (open: boolean) => {
        if (!open) {
            setSelectedReportId(null);
        }
    };

    if (reports.length === 0) {
        return (
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 py-16 text-center text-zinc-500">
                등록된 활동보고서가 없습니다.
            </div>
        );
    }
    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {reports.map((report) => (
                    <button
                        key={report.id}
                        type="button"
                        className="w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white text-left transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                        onClick={() => openReportModal(report)}>
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
                                <div className="h-full w-full flex items-center justify-center text-zinc-400 text-sm">
                                    이미지 없음
                                </div>
                            )}
                        </div>
                        <div className="p-4 space-y-2">
                            <h3 className="font-semibold text-zinc-900 line-clamp-2">{report.title}</h3>
                            <p className="text-sm text-zinc-600">{formatDateByLocale(report.createdAt)}</p>
                        </div>
                    </button>
                ))}
            </div>

            <ClubReportDetailModal
                report={selectedReport}
                open={selectedReport !== null}
                onOpenChange={closeReportModal}
            />
        </>
    );
}

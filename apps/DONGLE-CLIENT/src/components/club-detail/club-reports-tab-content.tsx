"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { formatDateByLocale } from "@dongle/ui";
import ClubReportDetailModal from "./club-report-detail-modal";

type ClubReportCardViewModel = {
    id: number;
    title: string;
    createdAt: string;
    image_urls: string[];
};

type ClubReportDetailViewModel = ClubReportCardViewModel & {
    content: string;
};

interface ClubReportsTabContentProps {
    clubId: string;
    reports: ClubReportCardViewModel[];
}

export default function ClubReportsTabContent({ clubId, reports }: ClubReportsTabContentProps) {
    const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
    const [selectedReport, setSelectedReport] = useState<ClubReportDetailViewModel | null>(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);

    useEffect(() => {
        if (selectedReportId === null) {
            setSelectedReport(null);
            setIsDetailLoading(false);
            return;
        }

        const controller = new AbortController();
        setIsDetailLoading(true);

        void fetch(`/api/clubs/${clubId}/reports/${selectedReportId}`, {
            signal: controller.signal,
        })
            .then(async (response) => {
                const data = await response.json();

                if (!response.ok || !data.isSuccess || !data.result) {
                    throw new Error("활동보고서 상세 조회 실패");
                }

                setSelectedReport(data.result);
            })
            .catch((error) => {
                if (controller.signal.aborted) {
                    return;
                }

                console.error(error);
                setSelectedReport(null);
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setIsDetailLoading(false);
                }
            });

        return () => controller.abort();
    }, [clubId, selectedReportId]);

    const openReportModal = (report: ClubReportCardViewModel) => {
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
                key={`${selectedReportId ?? "empty"}-${selectedReport !== null ? "loaded" : "idle"}`}
                report={selectedReport}
                open={selectedReportId !== null}
                isLoading={isDetailLoading}
                onOpenChange={closeReportModal}
            />
        </>
    );
}

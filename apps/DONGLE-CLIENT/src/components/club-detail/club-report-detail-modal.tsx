"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { RichTextViewer } from "@dongle/rich-text";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@dongle/ui/dialog";
import { Skeleton } from "@dongle/ui/skeleton";
import { formatDateByLocale } from "@dongle/ui/utils";

type ClubReportDetailViewModel = {
    id: number;
    title: string;
    content: string;
    createdAt: string;
    image_urls: string[];
};

interface ClubReportDetailModalProps {
    report: ClubReportDetailViewModel | null;
    open: boolean;
    isLoading?: boolean;
    onOpenChange: (open: boolean) => void;
}

const styles = {
    imageNavButton:
        "absolute top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/70 flex items-center justify-center disabled:opacity-40",
} as const;

export default function ClubReportDetailModal({
    report,
    open,
    isLoading = false,
    onOpenChange,
}: ClubReportDetailModalProps) {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    const selectedImages = report?.image_urls ?? [];
    const hasImages = selectedImages.length > 0;
    const dialogTitle = report?.title ?? (isLoading ? "활동보고서 불러오는 중" : "활동보고서 상세");
    const dialogDescription = report ? `작성일 ${formatDateByLocale(report.createdAt)}` : "활동보고서 상세 정보를 표시합니다.";

    const goPrevImage = () => {
        if (!hasImages) return;
        setSelectedImageIndex((prev) => (prev === 0 ? selectedImages.length - 1 : prev - 1));
    };

    const goNextImage = () => {
        if (!hasImages) return;
        setSelectedImageIndex((prev) => (prev === selectedImages.length - 1 ? 0 : prev + 1));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-full max-w-[90vw] sm:max-w-2xl max-h-[90vh] p-0 gap-0 overflow-hidden">
                <DialogTitle className="sr-only">{dialogTitle}</DialogTitle>
                <DialogDescription className="sr-only">{dialogDescription}</DialogDescription>
                {isLoading ? (
                    <section className="p-4 md:p-5 min-h-0 max-h-[90vh] overflow-y-auto space-y-4">
                        <div className="flex flex-col gap-4 pt-4">
                            <Skeleton className="aspect-[16/10] w-full rounded-xl" />

                            <div className="flex gap-2 overflow-x-auto pb-1">
                                <Skeleton className="h-14 w-20 shrink-0 rounded-md" />
                                <Skeleton className="h-14 w-20 shrink-0 rounded-md" />
                                <Skeleton className="h-14 w-20 shrink-0 rounded-md" />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Skeleton className="h-8 w-2/3 rounded-md" />
                            <Skeleton className="h-4 w-28 rounded-md" />
                        </div>

                        <div className="space-y-3 py-4">
                            <Skeleton className="h-4 w-full rounded-md" />
                            <Skeleton className="h-4 w-full rounded-md" />
                            <Skeleton className="h-4 w-5/6 rounded-md" />
                            <Skeleton className="h-4 w-full rounded-md" />
                            <Skeleton className="h-4 w-4/6 rounded-md" />
                        </div>

                        <div className="pt-2">
                            <Skeleton className="h-10 w-full rounded-md" />
                        </div>
                    </section>
                ) : report ? (
                    <section className="p-4 md:p-5 min-h-0 max-h-[90vh] overflow-y-auto space-y-4">
                        {hasImages && (
                            <div className="flex flex-col gap-4 pt-4">
                                <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-zinc-100">
                                    <Image
                                        src={selectedImages[selectedImageIndex]}
                                        alt={`${report.title} 이미지 ${selectedImageIndex + 1}`}
                                        fill
                                        sizes="(min-width: 1024px) 900px, 100vw"
                                        className="object-cover"
                                    />
                                    {selectedImages.length > 1 && (
                                        <>
                                            <button
                                                type="button"
                                                aria-label="이전 이미지"
                                                onClick={goPrevImage}
                                                className={`${styles.imageNavButton} left-2`}>
                                                <ChevronLeft size={18} />
                                            </button>
                                            <button
                                                type="button"
                                                aria-label="다음 이미지"
                                                onClick={goNextImage}
                                                className={`${styles.imageNavButton} right-2`}>
                                                <ChevronRight size={18} />
                                            </button>
                                        </>
                                    )}
                                </div>

                                {selectedImages.length > 1 && (
                                    <div className="flex gap-2 overflow-x-auto pb-1">
                                        {selectedImages.map((imageUrl, index) => (
                                            <button
                                                key={`${report.id}-${index}`}
                                                type="button"
                                                data-active={selectedImageIndex === index}
                                                className="relative h-14 w-20 shrink-0 overflow-hidden rounded-md border border-zinc-200 bg-zinc-100 data-[active=true]:ring-2 data-[active=true]:ring-primary"
                                                onClick={() => setSelectedImageIndex(index)}>
                                                <Image
                                                    src={imageUrl}
                                                    alt={`${report.title} 썸네일 ${index + 1}`}
                                                    fill
                                                    sizes="80px"
                                                    className="object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <h2 className="pr-8 text-xl font-bold text-zinc-900">{report.title}</h2>
                        <p className="text-sm text-zinc-500">작성일 {formatDateByLocale(report.createdAt)}</p>
                        <div className="min-h-[180px] py-4">
                            <RichTextViewer html={report.content} />
                        </div>

                        <div className="pt-2">
                            <DialogClose asChild>
                                <button
                                    type="button"
                                    className="w-full rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50">
                                    닫기
                                </button>
                            </DialogClose>
                        </div>
                    </section>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}

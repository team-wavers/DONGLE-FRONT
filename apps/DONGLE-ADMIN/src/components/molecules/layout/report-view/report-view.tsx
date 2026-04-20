"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@dongle/ui/button";
import { ArrowLeft, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogOverlay, DialogPortal, DialogTitle } from "@dongle/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@dongle/ui/carousel";
import { RichTextViewer } from "@dongle/rich-text";
import { formatKoreanDate } from "@/lib/format/date";

type ReportViewModel = {
    title: string;
    content: string;
    createdAt: string;
    image_urls: string[];
};

interface ReportViewProps {
    report: ReportViewModel;
    backHref?: string;
    backButtonText?: string;
}

export default function ReportView({ report, backHref, backButtonText = "돌아가기" }: ReportViewProps) {
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

    const validImageUrls = report.image_urls?.filter((url: string) => url && url.trim() !== "") || [];

    const handlePrevImage = () => {
        if (selectedImageIndex === null) return;
        setSelectedImageIndex((prev) => {
            if (prev === null) return null;
            return prev === 0 ? validImageUrls.length - 1 : prev - 1;
        });
    };

    const handleNextImage = () => {
        if (selectedImageIndex === null) return;
        setSelectedImageIndex((prev) => {
            if (prev === null) return null;
            return prev === validImageUrls.length - 1 ? 0 : prev + 1;
        });
    };

    return (
        <div className="flex flex-col gap-4 w-full items-start">
            {/* 뒤로가기 버튼 - 상단 고정 */}
            {backHref && (
                <div className="flex justify-start w-full">
                    <Link href={backHref}>
                        <Button variant="outline">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            {backButtonText}
                        </Button>
                    </Link>
                </div>
            )}
            <div className="max-w-4xl w-full">
                {/* 이미지들 */}
                {validImageUrls.length > 0 && (
                    <div className="relative w-full md:mb-12 mb-8">
                        <Carousel
                            opts={{
                                align: "start",
                                loop: true,
                            }}
                            className="w-full">
                            <CarouselContent>
                                {validImageUrls.map((url: string, index: number) => (
                                    <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                                        <div
                                            className="relative cursor-pointer group overflow-hidden rounded-lg border"
                                            onClick={() => setSelectedImageIndex(index)}>
                                            <Image
                                                src={url}
                                                alt={`보고서 이미지 ${index + 1}`}
                                                width={500}
                                                height={300}
                                                className="w-full aspect-square object-cover transition-transform group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            {validImageUrls.length > 1 && (
                                <>
                                    <CarouselPrevious className="left-2 bg-white/90 hover:bg-white border-0 shadow-lg disabled:opacity-30" />
                                    <CarouselNext className="right-2 bg-white/90 hover:bg-white border-0 shadow-lg disabled:opacity-30" />
                                </>
                            )}
                        </Carousel>
                    </div>
                )}

                {/* 제목 */}
                <div>
                    <h1 className="text-2xl font-bold my-4">{report.title}</h1>
                </div>

                {/* 작성일 */}
                <div className="flex flex-col gap-2 text-sm text-gray-500">
                    <p>작성일: {formatKoreanDate(report.createdAt)}</p>
                </div>

                {/* 내용 */}
                <div className="min-h-36 py-4">
                    <RichTextViewer html={report.content} />
                </div>
            </div>

            {/* 이미지 모달 */}
            <Dialog open={selectedImageIndex !== null} onOpenChange={(open) => !open && setSelectedImageIndex(null)}>
                <DialogPortal>
                    <DialogOverlay className="bg-black/70" />
                    <DialogContent
                        className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 border-0 bg-transparent shadow-none"
                        showCloseButton={false}>
                        <DialogTitle className="sr-only">
                            보고서 이미지 {selectedImageIndex !== null && selectedImageIndex + 1}
                        </DialogTitle>
                        <div className="relative flex items-center justify-center">
                            {/* 닫기 버튼 */}
                            <button
                                onClick={() => setSelectedImageIndex(null)}
                                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                                aria-label="닫기">
                                <X className="w-6 h-6" />
                            </button>

                            {/* 이전 버튼 */}
                            {validImageUrls.length > 1 && (
                                <button
                                    onClick={handlePrevImage}
                                    className="absolute left-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                                    aria-label="이전 이미지">
                                    <ChevronLeft className="w-8 h-8" />
                                </button>
                            )}

                            {/* 이미지 */}
                            {selectedImageIndex !== null && (
                                <div className="relative max-w-[90vw] max-h-[90vh]">
                                    <Image
                                        src={validImageUrls[selectedImageIndex]}
                                        alt={`보고서 이미지 ${selectedImageIndex + 1}`}
                                        width={1920}
                                        height={1080}
                                        className="w-auto h-auto max-w-full max-h-[90vh] object-contain"
                                    />
                                </div>
                            )}

                            {selectedImageIndex !== null && validImageUrls.length > 1 && (
                                <div className="absolute bottom-4 left-1/2 top-4 -translate-x-1/2 px-4 py-2 h-fit rounded-full bg-black/50 text-white text-sm z-10 flex items-center justify-center">
                                    {selectedImageIndex !== null ? selectedImageIndex + 1 : 0} / {validImageUrls.length}
                                </div>
                            )}

                            {/* 다음 버튼 */}
                            {validImageUrls.length > 1 && (
                                <button
                                    onClick={handleNextImage}
                                    className="absolute right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                                    aria-label="다음 이미지">
                                    <ChevronRight className="w-8 h-8" />
                                </button>
                            )}
                        </div>
                    </DialogContent>
                </DialogPortal>
            </Dialog>
        </div>
    );
}

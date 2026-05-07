import type { ClubReport } from "@dongle/types/club/club.report";
import { ImageIcon } from "lucide-react";
import Image from "next/image";

interface ReportImageGalleryProps {
    report: ClubReport;
}

export default function ReportImageGallery({ report }: ReportImageGalleryProps) {
    const validImageUrls = report.image_urls.filter((url) => url.trim().length > 0);

    if (validImageUrls.length === 0) {
        return (
            <section className="rounded-lg border border-zinc-200 bg-zinc-50 p-8">
                <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-center text-zinc-400">
                    <ImageIcon className="size-8" aria-hidden="true" />
                    <p className="text-sm font-bold">등록된 사진이 없습니다.</p>
                </div>
            </section>
        );
    }

    const [coverImageUrl, ...restImageUrls] = validImageUrls;

    return (
        <section className="space-y-3">
            <div className="relative h-72 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 md:h-[420px]">
                <Image
                    src={coverImageUrl}
                    alt={`${report.title} 대표 사진`}
                    fill
                    sizes="(min-width: 1024px) 744px, 100vw"
                    className="object-cover"
                    priority
                />
            </div>

            {restImageUrls.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                    {restImageUrls.map((imageUrl, index) => (
                        <div
                            key={imageUrl}
                            className="relative h-44 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 md:h-56">
                            <Image
                                src={imageUrl}
                                alt={`${report.title} 사진 ${index + 2}`}
                                fill
                                sizes="(min-width: 1024px) 372px, (min-width: 640px) 50vw, 100vw"
                                className="object-cover"
                            />
                        </div>
                    ))}
                </div>
            ) : null}
        </section>
    );
}

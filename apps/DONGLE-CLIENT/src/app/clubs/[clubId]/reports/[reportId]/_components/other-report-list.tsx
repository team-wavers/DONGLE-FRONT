import type { ClubReport } from "@dongle/types/club/club.report";
import { cn, formatDateByLocale } from "@dongle/ui/utils";
import { FileText, ImageIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface OtherReportListProps {
    clubId: number;
    reports: Pick<ClubReport, "id" | "title" | "createdAt" | "image_urls">[];
}

export default function OtherReportList({ clubId, reports }: OtherReportListProps) {
    return (
        <section className="rounded-lg border border-zinc-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-sm font-black text-zinc-950">다른 활동보고서</h2>
                <span className="text-xs font-bold text-zinc-400">{reports.length}개</span>
            </div>
            {reports.length === 0 ? (
                <div className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-md bg-zinc-50 px-4 py-6 text-center">
                    <FileText className="size-6 text-zinc-300" aria-hidden="true" />
                    <p className="text-sm font-bold leading-5 text-zinc-400">다른 활동보고서가 없습니다.</p>
                </div>
            ) : (
                <div className="grid gap-2">
                    {reports.map((report) => {
                        const thumbnailUrl = report.image_urls.find((url) => url.trim().length > 0);

                        return (
                            <Link
                                key={report.id}
                                href={`/clubs/${clubId}/reports/${report.id}`}
                                className={cn(
                                    "rounded-md p-2 transition-colors hover:bg-zinc-50",
                                    thumbnailUrl ? "grid grid-cols-[56px_minmax(0,1fr)] gap-3" : "block"
                                )}>
                                {thumbnailUrl ? (
                                    <div className="relative size-14 overflow-hidden rounded-md bg-zinc-100">
                                        <Image
                                            src={thumbnailUrl}
                                            alt={`${report.title} 썸네일`}
                                            fill
                                            sizes="56px"
                                            className="object-cover"
                                        />
                                    </div>
                                ) : null}
                                <div className="min-w-0">
                                    <p className="line-clamp-2 text-sm font-bold leading-5 text-zinc-800">
                                        {report.title}
                                    </p>
                                    <p className="mt-1 text-xs font-bold text-zinc-400">
                                        {formatDateByLocale(report.createdAt)}
                                    </p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </section>
    );
}

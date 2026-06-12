import { MainBanner } from "@dongle/types/main-banner/main-banner";
import Link from "next/link";
import Image from "next/image";
import { formatKoreanDate } from "@/lib/format/date";
import { CalendarDays, ExternalLink, Images, Pencil } from "lucide-react";

interface MainBannerListProps {
    banners: MainBanner[];
}

export default function MainBannerList({ banners }: MainBannerListProps) {
    if (banners.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-lg border bg-white px-4 py-14 text-center text-muted-foreground">
                <Images className="mb-4 h-12 w-12 opacity-50" />
                <p className="text-base font-medium text-zinc-600">등록된 배너가 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-lg border bg-white">
            {banners.map((banner) => (
                <Link
                    key={banner.id}
                    href={`/admin/banner/${banner.id}/edit`}
                    aria-label={`메인 배너 ${banner.id} 수정`}
                    className="group grid gap-0 border-b transition-colors last:border-b-0 hover:bg-zinc-50 lg:grid-cols-[minmax(340px,480px)_minmax(0,1fr)]">
                    <div className="relative block aspect-[3/1] overflow-hidden bg-zinc-50 lg:h-full lg:min-h-40">
                        <Image
                            src={banner.image_url}
                            alt={`메인 배너 ${banner.id}`}
                            className="object-cover transition-transform duration-200 group-hover:scale-[1.01]"
                            fill
                            sizes="(min-width: 1024px) 480px, 100vw"
                        />
                        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-md border border-white/70 bg-white/90 px-2.5 py-1 text-xs font-semibold text-zinc-800 shadow-sm">
                            <span
                                className={
                                    banner.is_active ? "h-2 w-2 rounded-full bg-emerald-500" : "h-2 w-2 rounded-full bg-zinc-400"
                                }
                            />
                            {banner.is_active ? "사용" : "미사용"}
                        </span>
                    </div>
                    <div className="flex min-w-0 flex-col justify-between gap-5 p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-zinc-900">메인 배너 #{banner.id}</p>
                                <p className="mt-1 text-xs text-muted-foreground">홈 화면 상단 노출 이미지</p>
                            </div>
                            <span className="inline-flex h-8 shrink-0 items-center gap-1 rounded-md px-2 text-sm font-medium text-zinc-600 transition-colors group-hover:bg-zinc-100 group-hover:text-zinc-900">
                                <Pencil className="h-4 w-4" />
                                수정
                            </span>
                        </div>

                        <div className="flex min-w-0 flex-wrap gap-x-5 gap-y-2 text-sm text-zinc-700">
                            <div className="flex items-center gap-2">
                                <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
                                <span className="font-medium">
                                    {formatKoreanDate(banner.publish_start_at)} ~ {formatKoreanDate(banner.publish_end_at)}
                                </span>
                            </div>
                            {banner.link_url ? (
                                <div className="flex min-w-0 items-center gap-2">
                                    <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
                                    <span className="truncate font-medium">{banner.link_url}</span>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}

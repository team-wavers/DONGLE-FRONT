import { MainBanner } from "@dongle/types/main-banner/main-banner";
import { Card, CardContent } from "@dongle/ui/card";
import { Badge } from "@dongle/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { formatKoreanDate } from "@/lib/format/date";

interface MainBannerListProps {
    banners: MainBanner[];
}

export default function MainBannerList({ banners }: MainBannerListProps) {
    return (
        <div className="grid gap-4">
            {banners.map((banner) => (
                <Link key={banner.id} href={`/admin/banner/${banner.id}/edit`} className="block group">
                    <Card className="transition-colors group-hover:bg-zinc-50 cursor-pointer">
                        <CardContent className="space-y-4">
                            <Image
                                src={banner.image_url}
                                alt={`메인 배너 ${banner.id}`}
                                className="w-full max-h-56 object-cover rounded-md border"
                                width={1200}
                                height={400}
                            />
                            <div className="flex items-center gap-2 text-sm text-zinc-700 flex-wrap">
                                <Badge
                                    className={
                                        banner.is_active
                                            ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                            : "bg-zinc-100 text-zinc-600 border-zinc-200"
                                    }>
                                    {banner.is_active ? "사용" : "미사용"}
                                </Badge>
                                <div>
                                    노출 기간: <span className="font-bold">{formatKoreanDate(banner.publish_start_at)}</span>{" "}
                                    ~ <span className="font-bold">{formatKoreanDate(banner.publish_end_at)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    );
}

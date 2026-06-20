import { ArrowRight, CalendarDays } from "lucide-react";
import { Card } from "@dongle/ui/card";
import { cn } from "@dongle/ui/utils";
import Link from "next/link";
import { formatKoreanDate } from "@/lib/format/date";

export interface ReportCardProps {
    title: string;
    content?: string;
    createdDate?: string;
    className?: string;
    href: string;
}

export default function ReportCard({ title, createdDate, className, href }: ReportCardProps) {
    return (
        <Link href={href} className="group block w-full cursor-pointer">
            <Card
                className={cn(
                    "w-full rounded-lg py-0 shadow-none transition-colors group-hover:bg-zinc-50",
                    className
                )}>
                <div className="grid grid-cols-1 items-center gap-3 px-5 py-4 md:grid-cols-[minmax(0,1fr)_180px_24px]">
                    <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-zinc-900">{title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">활동보고서</p>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarDays className="h-4 w-4 shrink-0" />
                        <span>{createdDate ? formatKoreanDate(createdDate) : "작성일 없음"}</span>
                    </div>

                    <ArrowRight className="hidden h-5 w-5 justify-self-end text-muted-foreground transition-transform group-hover:translate-x-0.5 md:block" />
                </div>
            </Card>
        </Link>
    );
}

import { formatKoreanDate } from "@/lib/format/date";
import { cn } from "@dongle/ui/utils";
import { ArrowRight, CalendarDays, FileText } from "lucide-react";
import Link from "next/link";

export interface ReportCardProps {
    title: string;
    content?: string;
    createdDate?: string;
    className?: string;
    href: string;
}

export default function ReportCard({ title, createdDate, className, href }: ReportCardProps) {
    return (
        <Link
            href={href}
            className={cn(
                "grid w-full cursor-pointer grid-cols-1 items-center gap-4 border-b px-5 py-4 text-left transition-colors last:border-b-0 hover:bg-zinc-50 md:grid-cols-[minmax(0,1fr)_180px_24px]",
                className
            )}>
            <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                    <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-zinc-900">{title}</p>
                </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4 shrink-0" />
                <span>{createdDate ? formatKoreanDate(createdDate) : "작성일 없음"}</span>
            </div>

            <ArrowRight className="hidden h-5 w-5 justify-self-end text-muted-foreground md:block" />
        </Link>
    );
}

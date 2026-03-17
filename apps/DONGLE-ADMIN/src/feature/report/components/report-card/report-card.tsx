import { Card, CardHeader, CardTitle } from "@dongle/ui/card";
import { cn } from "@dongle/ui/utils";
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
        <Link href={href} className="w-full">
            <Card className={cn(className, "w-full  flex flex-row justify-between")}>
                <CardHeader className="flex flex-col w-full">
                    <div className="flex items-center gap-3">
                        <div className="flex-1">
                            <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        {createdDate && (
                            <span className="text-xs text-gray-500">작성일 : {createdDate.split("T")[0]}</span>
                        )}
                    </div>
                </CardHeader>
            </Card>
        </Link>
    );
}

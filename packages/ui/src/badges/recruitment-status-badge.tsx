import { Badge } from "./badge";
import { cn } from "../utils";

export type RecruitmentStatus = "recruiting" | "closed";

interface RecruitmentStatusBadgeProps {
    status?: RecruitmentStatus;
    isRecruiting?: boolean;
    className?: string;
}

export function RecruitmentStatusBadge({ status, isRecruiting, className }: RecruitmentStatusBadgeProps) {
    const recruiting = status ? status === "recruiting" : Boolean(isRecruiting);

    return (
        <Badge
            variant="outline"
            className={cn(
                "w-fit text-sm font-semibold border-none rounded-lg px-4 py-2",
                recruiting ? "bg-emerald-500 text-white" : "bg-zinc-100 text-zinc-500",
                className
            )}>
            {recruiting ? "모집중" : "모집마감"}
        </Badge>
    );
}

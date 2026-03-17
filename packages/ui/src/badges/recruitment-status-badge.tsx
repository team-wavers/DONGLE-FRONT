import { Badge } from "./badge";
import { cn } from "../utils";

export type RecruitmentStatus = "recruiting" | "closed";
export type RecruitmentStatusBadgeSize = "sm" | "md" | "lg";

const sizeStyles: Record<RecruitmentStatusBadgeSize, string> = {
    sm: "rounded-md px-2.5 py-1 text-xs",
    md: "rounded-lg px-4 py-2 text-sm",
    lg: "rounded-xl px-6 py-2.5 text-base",
};

interface RecruitmentStatusBadgeProps {
    status?: RecruitmentStatus;
    isRecruiting?: boolean;
    size?: RecruitmentStatusBadgeSize;
    className?: string;
}

export function RecruitmentStatusBadge({ status, isRecruiting, size = "md", className }: RecruitmentStatusBadgeProps) {
    const recruiting = status ? status === "recruiting" : Boolean(isRecruiting);

    return (
        <Badge
            variant="outline"
            className={cn(
                "w-fit border-none font-semibold",
                sizeStyles[size],
                recruiting ? "bg-emerald-500 text-white" : "bg-zinc-100 text-zinc-500",
                className
            )}>
            {recruiting ? "모집중" : "모집마감"}
        </Badge>
    );
}

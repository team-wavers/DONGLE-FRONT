import { Badge } from "@dongle/ui/badge";
import type { ScheduleType } from "../schedule.types";
import { SCHEDULE_TYPE_LABELS } from "../schedule.types";

const typeClassName: Record<ScheduleType, string> = {
    recruitment: "border-sky-200 bg-sky-50 text-sky-700",
    event: "border-violet-200 bg-violet-50 text-violet-700",
    regular_meeting: "border-emerald-200 bg-emerald-50 text-emerald-700",
    notice: "border-amber-200 bg-amber-50 text-amber-700",
};

export function ScheduleTypeBadge({ type }: { type: ScheduleType }) {
    return <Badge className={typeClassName[type]}>{SCHEDULE_TYPE_LABELS[type]}</Badge>;
}

export function ScheduleIsPublicBadge({ isPublic }: { isPublic: boolean }) {
    return (
        <Badge
            className={
                isPublic
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-zinc-200 bg-zinc-100 text-zinc-600"
            }>
            {isPublic ? "공개" : "비공개"}
        </Badge>
    );
}

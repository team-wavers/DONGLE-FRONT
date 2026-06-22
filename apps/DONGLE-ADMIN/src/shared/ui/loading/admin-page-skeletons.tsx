import { Skeleton } from "@dongle/ui/skeleton";
import { cn } from "@dongle/ui/utils";

const calendarCellIndexes = Array.from({ length: 42 }, (_, index) => index);

interface AdminPageSkeletonProps {
    className?: string;
}

interface AdminListPageSkeletonProps extends AdminPageSkeletonProps {
    showAction?: boolean;
    showSearch?: boolean;
    showTableHeader?: boolean;
}

export function AdminListPageSkeleton({
    className,
    showAction = false,
    showSearch = true,
    showTableHeader = false,
}: AdminListPageSkeletonProps) {
    return (
        <div className={cn("w-full space-y-5", className)}>
            <div className="flex items-center justify-between gap-4">
                <Skeleton className="h-5 w-28 rounded-lg" />
                {showAction ? <Skeleton className="h-10 w-24 rounded-lg" /> : null}
            </div>
            {showSearch ? <Skeleton className="h-11 w-full rounded-lg" /> : null}
            <div className="space-y-3">
                {showTableHeader ? <Skeleton className="hidden h-11 w-full rounded-lg lg:block" /> : null}
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-20 w-full rounded-xl" />
            </div>
        </div>
    );
}

export function AdminBannerListPageSkeleton() {
    return (
        <div className="w-full space-y-4">
            <div className="flex justify-end">
                <Skeleton className="h-10 w-24 rounded-lg" />
            </div>
            <div className="space-y-3">
                <div className="grid gap-4 lg:grid-cols-[minmax(340px,480px)_minmax(0,1fr)]">
                    <Skeleton className="aspect-[3/1] h-auto w-full rounded-xl lg:min-h-40" />
                    <div className="space-y-5 p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-32 rounded-lg" />
                                <Skeleton className="h-4 w-44 rounded-lg" />
                            </div>
                            <Skeleton className="h-8 w-16 rounded-lg" />
                        </div>
                        <Skeleton className="h-5 w-full max-w-lg rounded-lg" />
                    </div>
                </div>
                <div className="grid gap-4 lg:grid-cols-[minmax(340px,480px)_minmax(0,1fr)]">
                    <Skeleton className="aspect-[3/1] h-auto w-full rounded-xl lg:min-h-40" />
                    <div className="space-y-5 p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-32 rounded-lg" />
                                <Skeleton className="h-4 w-44 rounded-lg" />
                            </div>
                            <Skeleton className="h-8 w-16 rounded-lg" />
                        </div>
                        <Skeleton className="h-5 w-full max-w-lg rounded-lg" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export function AdminReportListPageSkeleton({ className }: AdminPageSkeletonProps) {
    return (
        <div className={cn("flex w-full flex-col gap-5", className)}>
            <div className="flex items-center justify-between gap-4">
                <Skeleton className="h-5 w-28 rounded-lg" />
                <Skeleton className="h-10 w-24 rounded-lg" />
            </div>
            <Skeleton className="h-11 w-full rounded-lg" />
            <div className="space-y-3">
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-20 w-full rounded-xl" />
            </div>
        </div>
    );
}

export function AdminFormPageSkeleton({ className }: AdminPageSkeletonProps) {
    return (
        <div className={cn("mx-auto flex w-full max-w-4xl flex-col gap-6", className)}>
            <Skeleton className="h-9 w-24 rounded-md" />
            <div className="space-y-4">
                <div className="space-y-2">
                    <Skeleton className="h-5 w-32 rounded-lg" />
                    <Skeleton className="h-4 w-full max-w-md rounded-lg" />
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-56 w-full rounded-lg" />
                    <div className="grid gap-4 md:grid-cols-2">
                        <Skeleton className="h-12 w-full rounded-lg" />
                        <Skeleton className="h-12 w-full rounded-lg" />
                    </div>
                </div>
            </div>
            <div className="space-y-4">
                <div className="space-y-2">
                    <Skeleton className="h-5 w-28 rounded-lg" />
                    <Skeleton className="h-4 w-full max-w-sm rounded-lg" />
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-12 w-full rounded-lg" />
                    <Skeleton className="h-12 w-full rounded-lg" />
                    <Skeleton className="h-10 w-44 rounded-lg" />
                </div>
            </div>
            <div className="flex flex-col-reverse gap-2 pt-4 sm:flex-row sm:items-center sm:justify-end">
                <Skeleton className="h-10 w-full rounded-lg sm:w-24" />
                <Skeleton className="h-10 w-full rounded-lg sm:w-28" />
            </div>
        </div>
    );
}

export function AdminSchedulePageSkeleton() {
    return (
        <div className="flex w-full flex-col gap-6">
            <div className="flex flex-col gap-3">
                <Skeleton className="h-11 w-full rounded-lg" />
                <div className="grid gap-3 md:grid-cols-4">
                    <Skeleton className="h-11 w-full rounded-xl" />
                    <Skeleton className="h-11 w-full rounded-xl" />
                    <Skeleton className="h-11 w-full rounded-xl" />
                    <Skeleton className="h-11 w-full rounded-xl" />
                </div>
            </div>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                    <Skeleton className="h-10 w-44 rounded-lg" />
                    <Skeleton className="h-10 w-28 rounded-lg" />
                </div>
                <Skeleton className="h-5 w-40 rounded-lg" />
            </div>
            <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                    <Skeleton className="h-7 w-36 rounded-lg" />
                    <div className="flex gap-2">
                        <Skeleton className="h-10 w-10 rounded-md" />
                        <Skeleton className="h-10 w-10 rounded-md" />
                    </div>
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {calendarCellIndexes.map((index) => (
                        <Skeleton key={index} className="h-28 rounded-lg" />
                    ))}
                </div>
            </div>
        </div>
    );
}

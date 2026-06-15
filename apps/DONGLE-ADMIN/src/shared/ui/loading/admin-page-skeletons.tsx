import { Skeleton } from "@dongle/ui/skeleton";

export function AdminListPageSkeleton() {
    return (
        <div className="space-y-5">
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

export function AdminFormPageSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-56 w-full rounded-xl" />
            <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
            </div>
            <Skeleton className="h-40 w-full rounded-xl" />
            <div className="flex justify-end gap-3">
                <Skeleton className="h-10 w-24 rounded-lg" />
                <Skeleton className="h-10 w-28 rounded-lg" />
            </div>
        </div>
    );
}

export function AdminSchedulePageSkeleton() {
    return (
        <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <Skeleton className="h-10 w-40 rounded-lg" />
                <Skeleton className="h-10 w-28 rounded-lg" />
            </div>
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
                <Skeleton className="h-[28rem] w-full rounded-xl" />
                <div className="space-y-3">
                    <Skeleton className="h-16 w-full rounded-xl" />
                    <Skeleton className="h-16 w-full rounded-xl" />
                    <Skeleton className="h-16 w-full rounded-xl" />
                </div>
            </div>
        </div>
    );
}

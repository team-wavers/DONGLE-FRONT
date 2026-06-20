import { Skeleton } from "@dongle/ui/skeleton";

export default function Loading() {
    return (
        <main className="mx-auto w-full max-w-6xl px-6 py-8">
            <div className="space-y-6">
                <Skeleton className="h-10 w-56 rounded-lg" />
                <Skeleton className="h-80 w-full rounded-xl" />
                <Skeleton className="h-28 w-full rounded-xl" />
                <Skeleton className="h-28 w-full rounded-xl" />
            </div>
        </main>
    );
}

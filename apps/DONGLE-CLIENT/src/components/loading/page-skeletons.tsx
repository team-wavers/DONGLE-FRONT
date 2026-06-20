import React from "react";
import { Skeleton } from "@dongle/ui/skeleton";

export function ClubDetailPageSkeleton({ showBackLink = false }: { showBackLink?: boolean }) {
    return (
        <>
            {showBackLink ? (
                <div className="pt-12">
                    <Skeleton className="h-10 w-36 rounded-lg" />
                </div>
            ) : null}
            <section className="flex flex-col gap-8 py-6">
                <header className="space-y-5">
                    <div className="flex items-center gap-4 py-4">
                        <Skeleton className="size-16 shrink-0 rounded-full" />
                        <div className="min-w-0 flex-1 space-y-3">
                            <Skeleton className="h-4 w-20 rounded-lg" />
                            <Skeleton className="h-12 w-2/3 max-w-xs rounded-lg" />
                        </div>
                        <Skeleton className="hidden h-9 w-24 shrink-0 rounded-full md:block" />
                    </div>
                    <Skeleton className="h-10 w-full max-w-md rounded-lg" />
                </header>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Skeleton className="h-24 w-full rounded-xl" />
                    <Skeleton className="h-24 w-full rounded-xl" />
                </div>

                <div className="space-y-4">
                    <Skeleton className="h-11 w-full rounded-lg" />
                    <Skeleton className="h-48 w-full rounded-xl" />
                </div>
            </section>
        </>
    );
}

function ReportMetaSkeleton() {
    return (
        <div className="flex flex-wrap gap-x-4 gap-y-2">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-5 w-28" />
        </div>
    );
}

function ClubSummaryCardSkeleton() {
    return (
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
            <div className="flex items-center gap-3">
                <Skeleton className="size-11 rounded-full" />
                <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="h-4 w-20" />
                </div>
            </div>
            <div className="mt-4 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
            </div>
        </div>
    );
}

function OtherReportListSkeleton() {
    return (
        <div className="space-y-3">
            <Skeleton className="h-6 w-28" />
            <div className="space-y-2">
                <Skeleton className="h-20 w-full rounded-md" />
                <Skeleton className="h-20 w-full rounded-md" />
                <Skeleton className="h-20 w-full rounded-md" />
            </div>
        </div>
    );
}

export function ClubReportDetailPageSkeleton() {
    return (
        <article className="py-6 md:py-10">
            <div className="mb-5">
                <Skeleton className="h-10 w-44 rounded-md" />
            </div>

            <header className="grid gap-6 border-b border-zinc-200 py-4 lg:grid-cols-[minmax(0,1fr)_280px]">
                <div className="min-w-0 space-y-4">
                    <Skeleton className="h-10 w-full max-w-xl md:h-12" />
                    <Skeleton className="h-10 w-2/3 max-w-lg md:h-12" />
                    <ReportMetaSkeleton />
                </div>
                <ClubSummaryCardSkeleton />
            </header>

            <div className="grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-start">
                <main className="min-w-0 space-y-8">
                    <Skeleton className="aspect-[4/3] w-full max-w-[720px] rounded-xl md:aspect-[16/9]" />
                    <section className="space-y-3 border-t border-zinc-200 pt-8">
                        <Skeleton className="h-5 w-full max-w-[720px]" />
                        <Skeleton className="h-5 w-full max-w-[680px]" />
                        <Skeleton className="h-5 w-full max-w-[700px]" />
                        <Skeleton className="h-5 w-4/5 max-w-[560px]" />
                        <Skeleton className="mt-6 h-5 w-full max-w-[640px]" />
                        <Skeleton className="h-5 w-2/3 max-w-[460px]" />
                    </section>
                </main>

                <aside className="space-y-4 lg:sticky lg:top-20">
                    <OtherReportListSkeleton />
                </aside>
            </div>
        </article>
    );
}

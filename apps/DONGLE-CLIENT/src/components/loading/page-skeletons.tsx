import React from "react";
import { Skeleton } from "@dongle/ui/skeleton";

function BackLinkSkeleton() {
    return (
        <div className="pt-12">
            <Skeleton className="h-10 w-36 rounded-md" />
        </div>
    );
}

function InfoCardSkeleton() {
    return (
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
            <Skeleton className="h-20 w-full" />
        </div>
    );
}

function ClubTabsSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-3 gap-2 border-b border-zinc-200">
                <Skeleton className="h-11 w-full rounded-none" />
                <Skeleton className="h-11 w-full rounded-none" />
                <Skeleton className="h-11 w-full rounded-none" />
            </div>
            <Skeleton className="h-44 w-full" />
        </div>
    );
}

export function ClubDetailPageSkeleton({ showBackLink = false }: { showBackLink?: boolean }) {
    return (
        <>
            {showBackLink ? <BackLinkSkeleton /> : null}
            <section className="flex flex-col gap-8 py-6">
                <header className="flex flex-col gap-6">
                    <div className="flex flex-col gap-5 py-4 md:flex-row md:items-end md:justify-between">
                        <div className="flex min-w-0 items-center gap-4">
                            <Skeleton className="size-16 rounded-full" />
                            <Skeleton className="h-14 w-56 md:w-72" />
                        </div>
                        <Skeleton className="h-9 w-24 rounded-full" />
                    </div>
                    <Skeleton className="h-10 w-full max-w-sm rounded-md" />
                </header>

                <section className="grid gap-5 md:grid-cols-[minmax(0,1fr)_280px]">
                    <div className="space-y-5">
                        <dl className="grid gap-3 sm:grid-cols-2">
                            <InfoCardSkeleton />
                            <InfoCardSkeleton />
                            <InfoCardSkeleton />
                            <InfoCardSkeleton />
                        </dl>
                        <ClubTabsSkeleton />
                    </div>
                    <aside className="hidden md:block" aria-hidden="true" />
                </section>
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

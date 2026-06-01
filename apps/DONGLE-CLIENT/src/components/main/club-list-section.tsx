"use client";

import { useEffect, useState } from "react";
import ClubIconAvatar from "@/components/main/club-icon-avatar";
import { RecruitmentStatusBadge } from "@dongle/ui/badges/recruitment-status-badge";
import { Button } from "@dongle/ui/button";
import { cn } from "@dongle/ui/utils";
import Link from "next/link";
import { getClubCategoryPresentation } from "@/components/main/club-category-presentation";

type ClubListItemViewModel = {
    id: number;
    name: string;
    icon_url?: string | null;
    category: string;
    tags: string[];
    is_recruiting: boolean;
};

interface ClubListSectionProps {
    clubs: ClubListItemViewModel[];
    summaryText: string;
    emptyStateMessage: string | null;
}

const CLUB_LIST_PAGE_SIZE = 12;

export default function ClubListSection({ clubs, summaryText, emptyStateMessage }: ClubListSectionProps) {
    const [visibleCount, setVisibleCount] = useState(CLUB_LIST_PAGE_SIZE);

    useEffect(() => {
        setVisibleCount(CLUB_LIST_PAGE_SIZE);
    }, [clubs]);

    const visibleClubs = clubs.slice(0, visibleCount);
    const remainingCount = Math.max(0, clubs.length - visibleCount);
    const hasMore = remainingCount > 0;
    const handleShowMore = () => {
        setVisibleCount((currentCount) => Math.min(clubs.length, currentCount + CLUB_LIST_PAGE_SIZE));
    };

    return (
        <div className="space-y-4">
            <div className="flex min-h-11 items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3">
                <p className="text-sm font-bold text-zinc-500">{summaryText}</p>
            </div>
            {emptyStateMessage ? (
                <div className="rounded-lg border border-zinc-200 bg-white px-6 py-10 text-center text-zinc-400">
                    {emptyStateMessage}
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="grid gap-3">
                        {visibleClubs.map((club) => {
                            const presentation = getClubCategoryPresentation(club.category);
                            const displayTags = club.tags.length > 0 ? club.tags.slice(0, 3) : [club.category];

                            return (
                                <Link
                                    key={club.id}
                                    href={`/clubs/${club.id}`}
                                    className="group flex min-h-24 items-center gap-4 rounded-lg border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300 hover:bg-zinc-50/50">
                                    <ClubIconAvatar
                                        name={club.name}
                                        category={club.category}
                                        iconUrl={club.icon_url}
                                        size="sm"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                                            <h3 className="truncate font-bold text-zinc-950">{club.name}</h3>
                                            <span
                                                className={cn(
                                                    "rounded-md border px-2 py-0.5 text-xs font-bold",
                                                    presentation.labelClassName
                                                )}>
                                                {club.category}
                                            </span>
                                        </div>
                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                            {displayTags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="max-w-full truncate rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-500">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <RecruitmentStatusBadge isRecruiting={club.is_recruiting} size="sm" />
                                </Link>
                            );
                        })}
                    </div>
                    {hasMore ? (
                        <div className="flex justify-center pt-2">
                            <Button type="button" variant="outline" className="min-w-40" onClick={handleShowMore}>
                                더보기 ({remainingCount}개 남음)
                            </Button>
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
}

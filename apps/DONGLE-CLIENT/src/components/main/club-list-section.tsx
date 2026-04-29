"use client";

import { ClubInfoCard } from "@dongle/ui/cards/club-info-card";
import Link from "next/link";

type ClubListItemViewModel = {
    id: number;
    name: string;
    category: string;
    is_recruiting: boolean;
};

interface ClubListSectionProps {
    clubs: ClubListItemViewModel[];
    summaryText: string;
    emptyStateMessage: string | null;
}

export default function ClubListSection({ clubs, summaryText, emptyStateMessage }: ClubListSectionProps) {
    return (
        <div className="space-y-4">
            <p className="font-semibold text-zinc-400 ml-2">{summaryText}</p>
            {emptyStateMessage ? (
                <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-10 text-center text-zinc-400">
                    {emptyStateMessage}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
                    {clubs.map((club) => (
                        <Link key={club.id} href={`/clubs/${club.id}`} className="block">
                            <ClubInfoCard
                                name={club.name}
                                category={club.category}
                                isRecruiting={club.is_recruiting}
                                variant="list"
                            />
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

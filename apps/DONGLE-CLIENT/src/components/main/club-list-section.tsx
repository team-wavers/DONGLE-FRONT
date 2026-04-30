"use client";

import { ClubInfoCard } from "@dongle/ui/cards/club-info-card";
import { Badge } from "@dongle/ui/badge";
import Link from "next/link";
import { Cpu, Dumbbell, Handshake, Landmark, Music2, Palette, Sparkles } from "lucide-react";

type ClubListItemViewModel = {
    id: number;
    name: string;
    category: string;
    is_recruiting: boolean;
    tags?: string[];
};

const categoryDeckStyle = {
    학술분과: { icon: Cpu, color: "text-blue-600 bg-blue-50 border-blue-200" },
    체육분과: { icon: Dumbbell, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
    문예분과: { icon: Palette, color: "text-fuchsia-600 bg-fuchsia-50 border-fuchsia-200" },
    봉사분과: { icon: Handshake, color: "text-amber-600 bg-amber-50 border-amber-200" },
    종교분과: { icon: Landmark, color: "text-violet-600 bg-violet-50 border-violet-200" },
    공연분과: { icon: Music2, color: "text-rose-600 bg-rose-50 border-rose-200" },
} as const;

function getCategoryDeckStyle(category: string) {
    return categoryDeckStyle[category as keyof typeof categoryDeckStyle] ?? {
        icon: Sparkles,
        color: "text-zinc-600 bg-zinc-50 border-zinc-200",
    };
}

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
                        <Link key={club.id} href={`/clubs/${club.id}`} className="relative block">
                            <ClubInfoCard
                                name={club.name}
                                category={club.category}
                                isRecruiting={club.is_recruiting}
                                variant="list"
                                footer={
                                    <div className="flex flex-wrap gap-2">
                                        {(club.tags ?? []).slice(0, 3).map((tag, index) => (
                                            <Badge
                                                key={`${club.id}-${tag}-${index}`}
                                                variant="outline"
                                                className="rounded-full border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-xs font-semibold text-zinc-600">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                }
                                footerClassName="px-6 pb-5"
                            />
                            <div className="pointer-events-none absolute right-5 top-5">
                                {(() => {
                                    const deck = getCategoryDeckStyle(club.category);
                                    const Icon = deck.icon;

                                    return (
                                        <span
                                            className={`inline-flex h-9 w-9 items-center justify-center rounded-full border ${deck.color}`}>
                                            <Icon className="h-4 w-4" />
                                        </span>
                                    );
                                })()}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

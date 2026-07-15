"use client";

import React from "react";
import ClubIconAvatar from "@/components/main/club-icon-avatar";
import { trackDongleEvent } from "@/lib/analytics";
import { formatRecruitDdayLabel, type ClosingSoonClub } from "@/lib/recruitment";
import Link from "next/link";

type ClosingSoonClubViewModel = {
    id: number;
    name: string;
    icon_url?: string | null;
    category: string;
};

interface RecruitmentClosingSectionProps {
    entries: ClosingSoonClub<ClosingSoonClubViewModel>[];
}

export default function RecruitmentClosingSection({ entries }: RecruitmentClosingSectionProps) {
    if (entries.length === 0) {
        return null;
    }

    return (
        <section aria-label="모집 마감 임박 동아리" className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-950">⏰ 모집 마감 임박</h2>
            <div className="flex gap-3 overflow-x-auto pb-1">
                {entries.map(({ club, dday }) => (
                    <Link
                        key={club.id}
                        href={`/clubs/${club.id}`}
                        onClick={() =>
                            trackDongleEvent("closing_soon_club_click", {
                                club_id: club.id,
                                club_name: club.name,
                                dday,
                            })
                        }
                        className="flex w-44 shrink-0 flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <ClubIconAvatar
                                name={club.name}
                                category={club.category}
                                iconUrl={club.icon_url}
                                size="sm"
                            />
                            <span
                                className={`rounded-md px-2 py-1 text-xs font-bold ${
                                    dday <= 3 ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                                }`}>
                                {formatRecruitDdayLabel(dday)}
                            </span>
                        </div>
                        <div className="min-w-0">
                            <h3 className="truncate text-sm font-bold text-zinc-950">{club.name}</h3>
                            <p className="truncate text-xs font-medium text-zinc-500">{club.category}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}

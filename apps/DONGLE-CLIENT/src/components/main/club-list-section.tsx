"use client";

import Link from "next/link";
import { getCategoryStyle } from "@/components/main/category-style";

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
                            {(() => {
                                const categoryStyle = getCategoryStyle(club.category);
                                const CategoryIcon = categoryStyle.icon;
                                const tags = [club.category, club.is_recruiting ? "모집중" : "모집마감"];

                                return (
                                    <article className="rounded-2xl border border-zinc-200 bg-white p-4 transition-colors hover:bg-zinc-50/70">
                                        <div className="flex items-start justify-between gap-3">
                                            <h3 className="line-clamp-1 text-base font-bold text-zinc-900">{club.name}</h3>
                                            <span
                                                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${club.is_recruiting ? "bg-blue-50 text-blue-600" : "bg-zinc-100 text-zinc-500"}`}>
                                                {club.is_recruiting ? "모집중" : "모집마감"}
                                            </span>
                                        </div>
                                        <div className="mt-3 flex flex-wrap items-center gap-1.5">
                                            <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold ${categoryStyle.badge}`}>
                                                <CategoryIcon className="size-3" />
                                                {club.category}
                                            </span>
                                            {tags.map((tag) => (
                                                <span key={`${club.id}-${tag}`} className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-600">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </article>
                                );
                            })()}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

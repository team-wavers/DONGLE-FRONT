"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Building2, Users } from "lucide-react";
import { Club } from "@dongle/types/club/club.d";
import { Badge } from "@dongle/ui/badge";
import SearchInput from "@/shared/ui/navigation/search-input/search-input";

interface FilterableClubListProps {
    clubs: Club[];
    emptyMessage: string;
    emptySearchMessage: string;
    searchPlaceholder: string;
}

export function normalizeClubKeyword(value: string) {
    return value.trim().toLowerCase();
}

export function matchesClub(club: Club, keyword: string) {
    if (!keyword) {
        return true;
    }

    const searchableText = [club.name, club.category].join(" ").toLowerCase();

    return searchableText.includes(keyword);
}

export function filterClubsByKeyword(clubs: Club[], keyword: string) {
    return clubs.filter((club) => matchesClub(club, keyword));
}

export default function FilterableClubList({
    clubs,
    emptyMessage,
    emptySearchMessage,
    searchPlaceholder,
}: FilterableClubListProps) {
    const [inputValue, setInputValue] = useState("");

    const deferredKeyword = useDeferredValue(normalizeClubKeyword(inputValue));
    const filteredClubs = useMemo(() => filterClubsByKeyword(clubs, deferredKeyword), [clubs, deferredKeyword]);

    if (clubs.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <Users className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p>{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-gray-600">
                    총 <span className="font-semibold text-blue-600">{clubs.length}</span>
                    개의 동아리
                </div>
            </div>

            <SearchInput value={inputValue} onChange={setInputValue} placeholder={searchPlaceholder} />

            {filteredClubs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    <Users className="mx-auto mb-4 h-12 w-12 opacity-50" />
                    <p>{emptySearchMessage}</p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-lg border bg-white">
                    {filteredClubs.map((club) => (
                        <Link
                            key={club.id}
                            href={`/admin/club/${club.id}`}
                            className="grid w-full cursor-pointer grid-cols-1 items-center gap-4 border-b px-5 py-4 text-left transition-colors last:border-b-0 hover:bg-zinc-50 md:grid-cols-[minmax(0,1fr)_140px_120px_40px]">
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                                    <Building2 className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-base font-semibold text-zinc-900">{club.name}</p>
                                    <p className="mt-1 text-xs text-muted-foreground md:hidden">{club.category}</p>
                                </div>
                            </div>
                            <Badge variant="secondary" className="hidden w-fit font-semibold md:inline-flex">
                                {club.category}
                            </Badge>
                            <Badge
                                className={
                                    club.is_recruiting
                                        ? "w-fit border-emerald-200 bg-emerald-50 text-emerald-700"
                                        : "w-fit border-zinc-200 bg-zinc-100 text-zinc-600"
                                }>
                                {club.is_recruiting ? "모집중" : "모집마감"}
                            </Badge>
                            <div className="hidden justify-self-end text-muted-foreground md:block">
                                <ArrowRight className="h-5 w-5" />
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

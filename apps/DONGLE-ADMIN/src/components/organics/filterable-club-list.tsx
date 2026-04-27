"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import { Club } from "@dongle/types/club/club.d";
import { ClubInfoCard } from "@dongle/ui/cards/club-info-card";
import SearchInput from "@/components/molecules/search-input/search-input";

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
    const router = useRouter();
    const [inputValue, setInputValue] = useState("");
    const [searchKeyword, setSearchKeyword] = useState("");

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setSearchKeyword(normalizeClubKeyword(inputValue));
        }, 300);

        return () => window.clearTimeout(timer);
    }, [inputValue]);

    const deferredKeyword = useDeferredValue(searchKeyword);
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
        <div className="flex flex-col gap-8">
            <div className="text-sm text-gray-600">
                총 <span className="font-semibold text-blue-600">{clubs.length}</span>
                개의 동아리
            </div>

            <SearchInput value={inputValue} onChange={setInputValue} placeholder={searchPlaceholder} />

            {filteredClubs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    <Users className="mx-auto mb-4 h-12 w-12 opacity-50" />
                    <p>{emptySearchMessage}</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredClubs.map((club) => (
                        <ClubInfoCard
                            key={club.id}
                            name={club.name}
                            category={club.category}
                            isRecruiting={club.is_recruiting}
                            onClick={() => router.push(`/admin/club/${club.id}`)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

"use client";

import { useDeferredValue, useEffect, useMemo, useState, useTransition } from "react";
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

function normalizeKeyword(value: string) {
    return value.trim().toLowerCase();
}

function matchesClub(club: Club, keyword: string) {
    if (!keyword) {
        return true;
    }

    const searchableText = [club.name, club.category].join(" ").toLowerCase();

    return searchableText.includes(keyword);
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
    const [isFiltering, startTransition] = useTransition();

    useEffect(() => {
        const timer = window.setTimeout(() => {
            startTransition(() => {
                setSearchKeyword(normalizeKeyword(inputValue));
            });
        }, 300);

        return () => window.clearTimeout(timer);
    }, [inputValue, startTransition]);

    const deferredKeyword = useDeferredValue(searchKeyword);
    const filteredClubs = useMemo(
        () => clubs.filter((club) => matchesClub(club, deferredKeyword)),
        [clubs, deferredKeyword]
    );

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
            <div className="flex flex-col gap-2">
                <SearchInput value={inputValue} onChange={setInputValue} placeholder={searchPlaceholder} />
                <p className="text-sm text-muted-foreground">
                    {isFiltering
                        ? "검색어를 반영하는 중입니다."
                        : `${filteredClubs.length}개의 동아리가 검색되었습니다.`}
                </p>
            </div>

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

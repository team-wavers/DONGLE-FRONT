"use client";

import { memo, useDeferredValue, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Building2, Users } from "lucide-react";
import { Club } from "@dongle/types/club/club.d";
import { Badge } from "@dongle/ui/badge";
import { SearchInput } from "@dongle/ui";
import { filterByKeyword, matchesKeyword, normalizeSearchQuery } from "@dongle/utils";
import { useUrlKeywordSearch } from "@/shared/hooks/use-url-keyword-search";

interface FilterableClubListProps {
    clubs: Club[];
    emptyMessage: string;
    emptySearchMessage: string;
    searchPlaceholder: string;
    loadFailed?: boolean;
}

function getClubSearchableText(club: Club) {
    return [club.name, club.category].join(" ");
}

export function normalizeClubKeyword(value: string) {
    return normalizeSearchQuery(value);
}

export function matchesClub(club: Club, keyword: string) {
    return matchesKeyword(getClubSearchableText(club), keyword);
}

export function filterClubsByKeyword(clubs: Club[], keyword: string) {
    return filterByKeyword(clubs, keyword, getClubSearchableText);
}

interface ClubListResultsProps {
    clubs: Club[];
    emptySearchMessage: string;
    keyword: string;
}

// keyword(useDeferredValue 결과)가 바뀔 때만 무거운 리스트를 다시 그린다.
// 이걸 memo로 분리해야 입력창 타이핑은 항상 즉시 반영되고, 한글 IME 조합 중에
// 리스트 리렌더링이 끼어들어 자모가 분리되는 문제가 생기지 않는다.
const ClubListResults = memo(function ClubListResults({ clubs, emptySearchMessage, keyword }: ClubListResultsProps) {
    const filteredClubs = useMemo(() => filterClubsByKeyword(clubs, keyword), [clubs, keyword]);

    if (filteredClubs.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <Users className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p>{emptySearchMessage}</p>
            </div>
        );
    }

    return (
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
    );
});

export default function FilterableClubList({
    clubs,
    emptyMessage,
    emptySearchMessage,
    searchPlaceholder,
    loadFailed = false,
}: FilterableClubListProps) {
    const { inputValue, keyword, onChange, onCompositionStart, onCompositionEnd } = useUrlKeywordSearch();

    const deferredKeyword = useDeferredValue(keyword);

    if (loadFailed) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <Users className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p>동아리 목록을 불러오지 못했습니다. 잠시 후 다시 확인해주세요.</p>
            </div>
        );
    }

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

            <SearchInput
                value={inputValue}
                onChange={onChange}
                onCompositionStart={onCompositionStart}
                onCompositionEnd={onCompositionEnd}
                placeholder={searchPlaceholder}
            />

            <ClubListResults clubs={clubs} emptySearchMessage={emptySearchMessage} keyword={deferredKeyword} />
        </div>
    );
}

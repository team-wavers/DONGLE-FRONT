"use client";

import React, { useDeferredValue, useMemo } from "react";
import type { User } from "@dongle/types/user/user.d";
import { Card, CardContent } from "@dongle/ui/card";
import { User as UserIcon } from "lucide-react";
import { SearchInput } from "@dongle/ui";
import { filterByKeyword, matchesKeyword, normalizeSearchQuery } from "@dongle/utils";
import { useUrlKeywordSearch } from "@/shared/hooks/use-url-keyword-search";
import UserCard from "@/feature/user/components/user-card";
import UserCreateButton from "@/feature/user/components/user-create-button";

interface FilterableUserListProps {
    users: User[];
    currentUserId?: number | null;
    loadFailed?: boolean;
}

function getUserSearchableText(user: User) {
    const roleLabel = user.role === "admin" ? "관리자" : "회장";
    return [user.name, user.login_id, user.phone, roleLabel, user.role, user.club?.name].filter(Boolean).join(" ");
}

export function normalizeUserKeyword(value: string) {
    return normalizeSearchQuery(value);
}

export function matchesUser(user: User, keyword: string) {
    return matchesKeyword(getUserSearchableText(user), keyword);
}

export function filterUsersByKeyword(users: User[], keyword: string) {
    return filterByKeyword(users, keyword, getUserSearchableText);
}

interface UserListResultsProps {
    users: User[];
    currentUserId?: number | null;
    keyword: string;
}

// keyword(useDeferredValue 결과)가 바뀔 때만 무거운 리스트를 다시 그린다.
// 이걸 memo로 분리해야 입력창 타이핑은 항상 즉시 반영되고, 한글 IME 조합 중에
// 리스트 리렌더링이 끼어들어 자모가 분리되는 문제가 생기지 않는다.
const UserListResults = React.memo(function UserListResults({ users, currentUserId, keyword }: UserListResultsProps) {
    const filteredUsers = useMemo(() => filterUsersByKeyword(users, keyword), [users, keyword]);

    if (filteredUsers.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <UserIcon className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p>검색 결과가 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-lg border bg-white">
            <div className="hidden grid-cols-[minmax(0,1.3fr)_100px_minmax(130px,0.75fr)_150px_120px_170px] gap-4 border-b bg-zinc-50 px-5 py-3 text-xs font-semibold text-muted-foreground lg:grid">
                <span>사용자</span>
                <span>역할</span>
                <span>로그인 ID</span>
                <span>연락처</span>
                <span>가입일</span>
                <span className="text-right">관리</span>
            </div>
            {filteredUsers.map((user) => (
                <UserCard key={user.id} user={user} currentUserId={currentUserId} />
            ))}
        </div>
    );
});

export default function FilterableUserList({ users, currentUserId, loadFailed = false }: FilterableUserListProps) {
    const { inputValue, keyword, onChange, onCompositionStart, onCompositionEnd } = useUrlKeywordSearch();

    const deferredKeyword = useDeferredValue(keyword);

    if (loadFailed) {
        return (
            <>
                <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="text-sm text-gray-600">
                        총 <span className="font-semibold text-blue-600">0</span>
                        명의 사용자
                    </div>
                </div>
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <UserIcon className="w-12 h-12 text-gray-400 mb-4" />
                        <p className="text-gray-500 text-lg">사용자 목록을 불러오지 못했습니다. 잠시 후 다시 확인해주세요.</p>
                    </CardContent>
                </Card>
            </>
        );
    }

    if (users.length === 0) {
        return (
            <>
                <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="text-sm text-gray-600">
                        총 <span className="font-semibold text-blue-600">0</span>
                        명의 사용자
                    </div>
                    <UserCreateButton />
                </div>
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <UserIcon className="w-12 h-12 text-gray-400 mb-4" />
                        <p className="text-gray-500 text-lg">등록된 사용자가 없습니다.</p>
                    </CardContent>
                </Card>
            </>
        );
    }

    return (
        <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                    총 <span className="font-semibold text-blue-600">{users.length}</span>
                    명의 사용자
                </div>
                <UserCreateButton />
            </div>

            <SearchInput
                value={inputValue}
                onChange={onChange}
                onCompositionStart={onCompositionStart}
                onCompositionEnd={onCompositionEnd}
                placeholder="이름, 로그인 ID, 전화번호, 역할, 동아리명 검색"
            />

            <UserListResults users={users} currentUserId={currentUserId} keyword={deferredKeyword} />
        </div>
    );
}

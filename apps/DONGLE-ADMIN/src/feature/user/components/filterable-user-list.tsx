"use client";

import { useDeferredValue, useMemo, useState } from "react";
import type { User } from "@dongle/types/user/user.d";
import { Card, CardContent } from "@dongle/ui/card";
import { User as UserIcon } from "lucide-react";
import SearchInput from "@/shared/ui/navigation/search-input/search-input";
import UserCard from "@/feature/user/components/user-card";
import UserCreateButton from "@/feature/user/components/user-create-button";

interface FilterableUserListProps {
    users: User[];
    currentUserId?: number | null;
}

export function normalizeUserKeyword(value: string) {
    return value.trim().toLowerCase();
}

export function matchesUser(user: User, keyword: string) {
    if (!keyword) {
        return true;
    }

    const roleLabel = user.role === "admin" ? "관리자" : "회장";
    const searchableText = [user.name, user.login_id, user.phone, roleLabel, user.role, user.club?.name]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

    return searchableText.includes(keyword);
}

export function filterUsersByKeyword(users: User[], keyword: string) {
    return users.filter((user) => matchesUser(user, keyword));
}

export default function FilterableUserList({ users, currentUserId }: FilterableUserListProps) {
    const [inputValue, setInputValue] = useState("");

    const deferredKeyword = useDeferredValue(normalizeUserKeyword(inputValue));
    const filteredUsers = useMemo(() => filterUsersByKeyword(users, deferredKeyword), [users, deferredKeyword]);

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
                onChange={setInputValue}
                placeholder="이름, 로그인 ID, 전화번호, 역할, 동아리명 검색"
            />

            {filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    <UserIcon className="mx-auto mb-4 h-12 w-12 opacity-50" />
                    <p>검색 결과가 없습니다.</p>
                </div>
            ) : (
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
            )}
        </div>
    );
}

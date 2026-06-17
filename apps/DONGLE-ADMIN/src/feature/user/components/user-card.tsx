"use client";

import { useState } from "react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { User } from "@dongle/types/user/user.d";
import { Badge } from "@dongle/ui/badge";
import { Button } from "@dongle/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@dongle/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@dongle/ui/tooltip";
import { Calendar, Edit, Phone, Trash2, User as UserIcon } from "lucide-react";
import UserEditForm from "@/feature/user/components/user-edit-form";
import { deleteUserAction } from "@/feature/user/action/delete-user.action";
import { formatMobilePhoneNumber } from "@dongle/utils";
import { formatKoreanDate } from "@/lib/format/date";
import { toast } from "sonner";

interface UserCardProps {
    user: User;
    currentUserId?: number | null;
}

export default function UserCard({ user, currentUserId }: UserCardProps) {
    const router = useRouter();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const isCurrentUser = currentUserId === user.id;

    const handleEditSuccess = () => {
        setIsEditModalOpen(false);
    };

    const handleDelete = () => {
        if (isCurrentUser) {
            toast.error("본인 계정은 삭제할 수 없습니다.");
            return;
        }

        startTransition(async () => {
            const result = await deleteUserAction(user.id);

            if (result.success) {
                toast.success("사용자가 성공적으로 삭제되었습니다.");
                setIsDeleteModalOpen(false);
                router.refresh();
            } else {
                toast.error(result.error ?? "사용자 삭제에 실패했습니다.");
            }
        });
    };

    const handleDeleteOpenChange = (nextOpen: boolean) => {
        if (!nextOpen && isPending) return;
        setIsDeleteModalOpen(nextOpen);
    };

    return (
        <>
            <div className="grid grid-cols-1 items-center gap-4 border-b px-5 py-4 last:border-b-0 lg:grid-cols-[minmax(0,1.3fr)_100px_minmax(130px,0.75fr)_150px_120px_170px]">
                <div className="flex min-w-0 items-center gap-3">
                    <UserIcon className="h-5 w-5 shrink-0 text-blue-600" />
                    <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-zinc-900">{user.name}</p>
                        {user.club && <p className="mt-1 truncate text-xs text-muted-foreground">{user.club.name}</p>}
                    </div>
                </div>
                <Badge
                    variant={user.role === "admin" ? "default" : "secondary"}
                    className={user.role === "admin" ? "w-fit bg-red-100 text-red-800" : "w-fit bg-blue-100 text-blue-800"}>
                    {user.role === "admin" ? "관리자" : "회장"}
                </Badge>
                <div className="text-sm text-gray-600">
                    <span className="lg:hidden">로그인 ID: </span>
                    {user.login_id}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4 shrink-0" />
                    <span>{formatMobilePhoneNumber(user.phone)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4 shrink-0" />
                    <span>{formatKoreanDate(user.created_at)}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditModalOpen(true)}
                        className="h-9 shrink-0 gap-1">
                        <Edit className="h-4 w-4" />
                        수정
                    </Button>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsDeleteModalOpen(true)}
                                    className="h-9 shrink-0 gap-1 text-red-600 hover:bg-red-50 hover:text-red-700"
                                    disabled={isPending || isCurrentUser}>
                                    <Trash2 className="h-4 w-4" />
                                    삭제
                                </Button>
                            </span>
                        </TooltipTrigger>
                        {isCurrentUser ? <TooltipContent>본인 계정은 삭제할 수 없습니다.</TooltipContent> : null}
                    </Tooltip>
                </div>
            </div>

            {isEditModalOpen && (
                <UserEditForm
                    user={user}
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSuccess={handleEditSuccess}
                />
            )}

            <Dialog open={isDeleteModalOpen} onOpenChange={handleDeleteOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>사용자 삭제 확인</DialogTitle>
                        <DialogDescription>
                            <strong>{user.name}</strong> 사용자를 정말 삭제하시겠습니까?
                            <br />
                            <span className="text-red-600 text-sm mt-2 block">⚠️ 이 작업은 되돌릴 수 없습니다.</span>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} disabled={isPending}>
                            취소
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
                            {isPending ? "삭제 중..." : "삭제"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

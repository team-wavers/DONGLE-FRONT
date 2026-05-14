"use client";

import { useState } from "react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { User } from "@dongle/types/user/user.d";
import { Card, CardContent, CardHeader, CardTitle } from "@dongle/ui/card";
import { Badge } from "@dongle/ui/badge";
import { Button } from "@dongle/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@dongle/ui/dialog";
import { User as UserIcon, Phone, Calendar, Edit, Trash2 } from "lucide-react";
import UserEditForm from "@/feature/user/components/user-edit-form";
import { deleteUserAction } from "@/feature/user/action/delete-user.action";
import { formatMobilePhoneNumber } from "@dongle/utils";
import { formatKoreanDate } from "@/lib/format/date";
import { toast } from "sonner";

interface UserCardProps {
    user: User;
}

export default function UserCard({ user }: UserCardProps) {
    const router = useRouter();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleEditSuccess = () => {
        setIsEditModalOpen(false);
    };

    const handleDelete = () => {
        startTransition(async () => {
            try {
                const result = await deleteUserAction(user.id);

                if (result.success) {
                    toast.success("사용자가 성공적으로 삭제되었습니다.");
                    setIsDeleteModalOpen(false);
                    router.refresh();
                } else {
                    toast.error(result.error ?? "사용자 삭제에 실패했습니다.");
                }
            } catch (error) {
                console.error("사용자 삭제 중 오류:", error);
                toast.error("사용자 삭제 중 오류가 발생했습니다.");
            }
        });
    };

    return (
        <>
            <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle className="text-lg flex items-center gap-2 min-w-0">
                            <UserIcon className="w-5 h-5 shrink-0 text-blue-600" />
                            <span className="truncate">{user.name}</span>
                        </CardTitle>
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <Badge
                                variant={user.role === "admin" ? "default" : "secondary"}
                                className={
                                    user.role === "admin" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
                                }>
                                {user.role === "admin" ? "관리자" : "회장"}
                            </Badge>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsEditModalOpen(true)}
                                className="flex items-center gap-1 shrink-0">
                                <Edit className="w-4 h-4" />
                                수정
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsDeleteModalOpen(true)}
                                className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0"
                                disabled={isPending}>
                                <Trash2 className="w-4 h-4" />
                                삭제
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span className="font-medium">로그인 ID:</span>
                                <span>{user.login_id}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="w-4 h-4" />
                                <span>{formatMobilePhoneNumber(user.phone)}</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            {user.club && (
                                <div className="text-sm text-gray-600">
                                    <span className="font-medium">소속 동아리:</span>
                                    <span className="ml-2">{user.club.name}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="w-4 h-4" />
                                <span>가입일: {formatKoreanDate(user.created_at)}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {isEditModalOpen && (
                <UserEditForm
                    user={user}
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSuccess={handleEditSuccess}
                />
            )}

            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
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
